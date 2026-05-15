# FoodGram 🍔

FoodGram is a full-stack video-sharing web application, similar to TikTok or Instagram Reels, but focused on food. It allows users to discover food from local partners and for food partners to showcase their items.

---

## ✨ Features

* **Dual Authentication System:** Separate registration and login for "Users" and "Food Partners."
* **Video Reel Feed:** A scrollable, auto-playing feed of food videos (like Reels).
* **User Interaction:** Users can like and save their favorite food videos.
* **Partner Profiles:** Users can visit the profile pages of the food partners.
* **Video Upload:** Food partners can create and upload new food items/videos.

---

## 🛠️ Tech Stack

* **Frontend:** React, React Router, Axios, Material-UI Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose)
* **Authentication:** JSON Web Tokens (JWT)
* **File Storage:** ImageKit (for video uploads)

---

## 📂 Project Structure

Here is the high-level structure of the FoodGram application:

<pre>
FoodGram/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── food.controller.js      
│   │   └── ...
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── foodpartner.model.js
│   │   └── food.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── food.routes.js
│   │   └── food-partner.routes.js
│   ├── .env.example
│   ├── app.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── BottomNavBar.jsx
│   │   ├── pages/
│   │   │   ├── general/
│   │   │   │   ├── Home.jsx
│   │   │   │   └── Saved.jsx
│   │   │   ├── food-partner/
│   │   │   │   ├── CreateFood.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── UserLogin.jsx
│   │   │   ├── UserRegister.jsx
│   │   │   └── ...
│   │   ├── styles/
│   │   │   └── auth.css
│   │   ├── AppRoutes.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
</pre>

## 🚀 Getting Started: Local Setup

Follow these instructions to get a copy of the project running on your local machine.

### Prerequisites

* Node.js (v18 or later)
* npm
* A MongoDB database (You can use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster)

### 1. Clone the Repository

```bash
git clone https://github.com/AshutoshRaj1260/FoodGram.git
cd FoodGram
```

## 🐳 Running with Docker (Recommended)

The easiest way to get FoodGram up and running is using Docker Compose. This will set up both the backend and frontend in containers.

### 1. Prerequisites
* [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.
* [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

### 2. Environment Variables
Create `.env` files in both the `backend` and `frontend` directories by copying the provided examples:

**Backend:**
```bash
cp backend/.env.example backend/.env
```
Fill in your `MONGO_URI` (from MongoDB Atlas) and other credentials in `backend/.env`.

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```
Fill in the `VITE_API_URL` and `VITE_GOOGLE_AUTH_URL` in `frontend/.env`.

### 3. Run with Docker Compose
From the root of the project, run:

```bash
docker-compose up --build
```

The application will be available at:
*   **Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Backend:** [http://localhost:3000](http://localhost:3000)

