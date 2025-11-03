# Contributing to FoodGram 🍔

We're thrilled you're interested in contributing to FoodGram! This document outlines how you can get involved, the development process, and what to expect.

## Table of Contents

1.  [Code of Conduct](#1-code-of-conduct)
2.  [How Can I Contribute?](#2-how-can-i-contribute)
    * [Reporting Bugs](#reporting-bugs)
    * [Suggesting Enhancements](#suggesting-enhancements)
    * [Writing Code](#writing-code)
        * [Good First Issues](#good-first-issues)
3.  [Getting Started](#3-getting-started)
    * [Prerequisites](#prerequisites)
    * [Local Setup](#local-setup)
    * [Running the Application](#running-the-application)
4.  [Development Workflow](#4-development-workflow)
    * [Branching Strategy](#branching-strategy)
    * [Commit Guidelines](#commit-guidelines)
    * [Opening a Pull Request (PR)](#opening-a-pull-request-pr)
5.  [Code Style & Quality](#5-code-style--quality)
6.  [Seeking Help](#6-seeking-help)

---

## 1. Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

## 2. How Can I Contribute?

There are many ways to contribute, even if you don't write code!

### Reporting Bugs

* Before opening a new issue, please check existing issues to see if the bug has already been reported.
* If not, open a new issue and clearly describe the bug.
    * **What steps reproduce the bug?** (Be specific)
    * **What did you expect to happen?**
    * **What actually happened?**
    * Include screenshots or video recordings if possible.
    * Mention your operating system, browser, and Node.js version.

### Suggesting Enhancements

* If you have an idea for a new feature or an improvement to an existing one, please open an issue to discuss it first.
* Clearly describe the proposed enhancement and its potential benefits.
* Explain why this feature would be useful for users or for the project's maintainability.

### Writing Code

If you're ready to dive into the codebase, here's how you can help:

#### Good First Issues

* Look for issues labeled `good first issue`. These are designed to be relatively straightforward and are a great way to get familiar with the codebase.

## 3. Getting Started

To contribute code, you'll need to set up the project locally.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)
* [npm](https://www.npmjs.com/) (usually comes with Node.js)
* A [MongoDB](https://www.mongodb.com/cloud/atlas/register) database (e.g., a free Atlas cluster)
* A [GitHub](https://github.com/) account

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
    MONGODB_URI=your_mongodb_connection_string

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

### Running the Application

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

## 4. Development Workflow

### Branching Strategy

We use a feature-branch workflow.
* **Always create a new branch** for your work, never work directly on `main`.
* Name your branches descriptively, e.g., `feature/add-dark-mode`, `bugfix/fix-login-error`, `docs/update-readme`.

### Commit Guidelines

* Write clear, concise commit messages.
* Start your commit message with a type (e.g., `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`).
* Example: `feat: Implement user login with JWT bearer tokens`

### Opening a Pull Request (PR)

1.  **Ensure your branch is up-to-date** with the `main` branch of the original repository:
    ```bash
    # From your feature branch
    git fetch upstream
    git rebase upstream/main
    git push origin your-branch-name --force # Use --force if you rebased
    ```
2.  Go to your forked repository on GitHub and click "Compare & pull request" for your new branch.
3.  Fill out the PR template thoroughly:
    * **Title:** A concise summary of your changes.
    * **Description:**
        * What problem does this PR solve?
        * How does it solve it?
        * Any relevant screenshots or GIFs for UI changes.
        * Reference any related issues (e.g., `Closes #123`, `Fixes #456`).
4.  Wait for feedback from maintainers. Be prepared to make further changes.

## 5. Code Style & Quality

* **ESLint/Prettier:** If you add these to your project later, please ensure your code adheres to the project's code style.
* **Testing:** Write tests for new features and bug fixes where appropriate. (If you add a testing framework later).
* **Clarity:** Write clean, readable, and well-commented code.

## 6. Seeking Help

If you get stuck or have questions:
* Open an issue on GitHub.
* Reach out to the maintainers directly (if contact info is provided in `README`).

Thank you for making FoodGram better!
