import os
import asyncio
import threading
import numpy as np
from pathlib import Path
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.uri_parser import parse_uri
from scipy.sparse import coo_matrix
from sklearn.neighbors import NearestNeighbors
from collections import defaultdict
from dotenv import load_dotenv

# Load the shared backend env first so the recommender uses the same Mongo URI
BACKEND_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(BACKEND_ENV_PATH)
load_dotenv()

# Configure basic logging for the recommender service (avoids raw prints)
logging.basicConfig(level=logging.INFO)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB") or parse_uri(MONGO_URI).get("database") or "test"
RECOMMENDER_K = int(os.getenv("RECOMMENDER_K", "10"))
RECOMMENDER_REFRESH_SECONDS = int(os.getenv("RECOMMENDER_REFRESH_SECONDS", "300"))

app = FastAPI(title="Recommender Service")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000, connectTimeoutMS=10000)
db = client[MONGO_DB]
model_lock = threading.RLock()

# In-memory model structures
user_index = {}
index_user = {}
item_index = {}
index_item = {}
ratings_matrix = None
knn = None


def build_matrix():
    global user_index, index_user, item_index, index_item, ratings_matrix, knn

    next_user_index = {}
    next_index_user = {}
    next_item_index = {}
    next_index_item = {}
    # Collect interactions from likes and saves
    interactions = defaultdict(float)  # (user, item) -> rating

    # If the DB is not reachable, avoid crashing startup — leave model empty
    try:
        # like weight = 1, save weight = 3 (saves carry more weight)
        for like in db["likes"].find({}, {"user": 1, "food": 1}):
            u = str(like.get("user"))
            i = str(like.get("food"))
            interactions[(u, i)] += 1.0

        for save in db["saves"].find({}, {"user": 1, "food": 1}):
            u = str(save.get("user"))
            i = str(save.get("food"))
            interactions[(u, i)] += 3.0
    except Exception as e:
        logging.warning("Could not read interactions from MongoDB at startup: %s", e)
        with model_lock:
            user_index = {}
            index_user = {}
            item_index = {}
            index_item = {}
            ratings_matrix = None
            knn = None
        return

    users = sorted({u for (u, i) in interactions.keys()})

    # Build the full item universe from all food documents so we can recommend
    # videos the user has not already interacted with.
    try:
        items = sorted({str(food.get("_id")) for food in db["foods"].find({}, {"_id": 1})})
    except Exception as e:
        logging.warning("Could not read food items from MongoDB at startup: %s", e)
        items = []

    if not users or not items:
        with model_lock:
            user_index = {}
            index_user = {}
            item_index = {}
            index_item = {}
            ratings_matrix = None
            knn = None
        return

    for idx, u in enumerate(users):
        next_user_index[u] = idx
        next_index_user[idx] = u
    for idx, i in enumerate(items):
        next_item_index[i] = idx
        next_index_item[idx] = i

    rows = []
    cols = []
    data = []

    for (u, i), r in interactions.items():
        rows.append(next_user_index[u])
        cols.append(next_item_index[i])
        data.append(r)

    next_ratings_matrix = coo_matrix((data, (rows, cols)), shape=(len(users), len(items)))

    # Fit KNN on user vectors (rows)
    try:
        next_knn = NearestNeighbors(metric="cosine", algorithm="brute")
        next_knn.fit(next_ratings_matrix)
    except Exception as e:
        next_knn = None
        logging.exception("KNN fit error: %s", e)

    with model_lock:
        user_index = next_user_index
        index_user = next_index_user
        item_index = next_item_index
        index_item = next_index_item
        ratings_matrix = next_ratings_matrix
        knn = next_knn


@app.on_event("startup")
async def startup_event():
    build_matrix()
    app.state.refresh_task = asyncio.create_task(refresh_model_loop())


@app.on_event("shutdown")
async def shutdown_event():
    refresh_task = getattr(app.state, "refresh_task", None)
    if refresh_task:
        refresh_task.cancel()
        try:
            await refresh_task
        except asyncio.CancelledError:
            pass


async def refresh_model_loop():
    while True:
        try:
            await asyncio.sleep(RECOMMENDER_REFRESH_SECONDS)
            await asyncio.to_thread(build_matrix)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.exception("Scheduled recommender refresh failed: %s", e)


class RecommendResponse(BaseModel):
    recommendations: list


@app.get("/recommend/{user_id}", response_model=RecommendResponse)
def recommend(user_id: str, n: int = 20):
    with model_lock:
        current_user_index = user_index
        current_index_item = index_item
        current_ratings_matrix = ratings_matrix
        current_knn = knn

    # If there's no model or user not present, return empty list
    if current_ratings_matrix is None or user_id not in current_user_index:
        # Cold start/new user
        return {"recommendations": []}

    uid = current_user_index[user_id]
    user_vector = current_ratings_matrix.getrow(uid)

    # Find neighbors
    if current_knn is None:
        return {"recommendations": []}

    # n_neighbors: RECOMMENDER_K + 1 (to exclude the user)
    k = min(RECOMMENDER_K + 1, current_ratings_matrix.shape[0])
    distances, indices = current_knn.kneighbors(user_vector, n_neighbors=k)
    distances = distances.flatten()
    indices = indices.flatten()

    # Exclude the user itself if present
    neighbor_info = []
    for dist, idx in zip(distances, indices):
        if idx == uid:
            continue
        sim = 1 - dist  # convert distance -> similarity
        if sim <= 0:
            continue
        neighbor_info.append((idx, sim))

    # Aggregate neighbor scores
    score = np.zeros(current_ratings_matrix.shape[1])
    for n_idx, sim in neighbor_info:
        neighbor_vector = current_ratings_matrix.getrow(n_idx).toarray().flatten()
        score += sim * neighbor_vector

    # Mask already-interacted items
    user_interactions = current_ratings_matrix.getrow(uid).toarray().flatten()
    score[user_interactions > 0] = -np.inf

    # Get top N indices
    top_indices = np.argsort(-score)[:n]
    recommended_items = [current_index_item[i] for i in top_indices if score[i] != -np.inf]

    return {"recommendations": recommended_items}


@app.post("/rebuild")
def rebuild_model():
    try:
        build_matrix()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
