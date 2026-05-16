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

## 🚀 Getting Started: 

Follow these instructions to get a copy of the project running on your local machine.

### Prerequisites

* Node.js (v18 or later)
* npm
* A MongoDB database (You can use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster)

### ImageKit API Keys

Follow the steps below to access the ImageKit API keys necessary to run the project:
- Access the website at: https://imagekit.io/ .
- Click on "Sign Up" to make an account and fill in the details as necessary.
- Navigate to "Developer Options" on the left panel to retrieve all keys:

![display](image.png)

### Local Setup

1.  **Fork the repository:**
    Go to the [FoodGram GitHub repository](https://github.com/AshutoshRaj1260/FoodGram) and click the "Fork" button in the top right.

2.  **Clone your forked repository:**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/FoodGram.git](https://github.com/YOUR_GITHUB_USERNAME/FoodGram.git)
    cd FoodGram
    ```
    (Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.)

3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory with the following variables:
    ```ini
    # Your MongoDB connection string
    MONGO_URI=your_mongodb_connection_string

    # A secret string for signing JWTs (recommended: at least 32 characters)
    JWT_SECRET=your_super_secret_key

    # Your frontend's local URL for CORS (Vite's default)
    FRONTEND_URL=http://localhost:5173

    # Your ImageKit credentials (for video uploads)
    IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
    IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
    IMAGEKIT_URL_ENDPOINT=[https://ik.imagekit.io/your_imagekit_id/](https://ik.imagekit.io/your_imagekit_id/)
    ```

4.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend # Go back to the root, then into frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory with:
    ```ini
    # Your backend's local API URL (Note: Vite uses VITE_ prefix for env vars)
    VITE_API_URL=http://localhost:8000
    ```
---

## Running the Application

You will need two separate terminal windows.

* **In Terminal 1 (Backend):**
    ```bash
    cd backend
    npm start # Or `nodemon server.js` if you have nodemon installed
    # The backend server should start on http://localhost:8000
    ```

* **In Terminal 2 (Frontend):**
    ```bash
    cd frontend
    npm run dev
    # The frontend application should be accessible at http://localhost:5173
    ```
    Open `http://localhost:5173` in your browser.

--- 

## Contributing 

FoodGram is **actively looking for contributors**, built in the open, and every PR matters.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, coding guidelines, and how to find
good first issues. Ensure all interactions follow the [CODE_OF_CONDUCT.md] (CODE_OF_CONDUCT.md).

Good places to start:

- Issues labeled
  [`good-first-issue`](https://github.com/Zerith-Labs/ZerithDB/issues?q=label%3Agood-first-issue)

---