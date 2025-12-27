---
description: Guide to deploying the QuikCort application (MERN Stack)
---

This guide outlines the steps to deploy the QuikCort application using **Render** for the backend and **Vercel** for the frontend.

## Prerequisites
- A GitHub account with the `QuikCort` repository pushed (Done).
- A [Render](https://render.com/) account.
- A [Vercel](https://vercel.com/) account.
- Your MongoDB Atlas connection string.
- Your Gemini API Key.

---

## Part 1: Deploy Backend (Render)

1.  **Create a Web Service**:
    - Log in to Render dashboard.
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository (`Raam751/Quikcort`).

2.  **Configure Service**:
    - **Name**: `quikcort-api` (or similar).
    - **Region**: Choose one close to you.
    - **Branch**: `main`.
    - **Root Directory**: Leave blank (defaults to repo root).
    - **Runtime**: `Node`.
    - **Build Command**: `npm install`
    - **Start Command**: `node src/app.js`

3.  **Environment Variables**:
    - Scroll down to "Environment Variables" and add the following:
        - `MONGO_URI`: (Your MongoDB Atlas connection string)
        - `JWT_SECRET`: (A secure random string)
        - `GEMINI_API_KEY`: (Your Google Gemini API Key)
        - `NODE_ENV`: `production`
        - `FRONTEND_URL`: (You will update this later with your Vercel URL, e.g., `https://quikcort-frontend.vercel.app`)

4.  **Deploy**:
    - Click **Create Web Service**.
    - Wait for the deployment to finish.
    - **Copy the Backend URL** provided by Render (e.g., `https://quikcort-api.onrender.com`).

---

## Part 2: Deploy Frontend (Vercel)

1.  **Import Project**:
    - Log in to Vercel dashboard.
    - Click **Add New...** -> **Project**.
    - Import your `Quikcort` repository.

2.  **Configure Project**:
    - **Framework Preset**: Create React App.
    - **Root Directory**: Click "Edit" and select `frontend`. **(Crucial Step)**.
    - **Build Command**: `npm run build` (Default).
    - **Output Directory**: `build` (Default).

3.  **Environment Variables**:
    - Expand the "Environment Variables" section.
    - Add:
        - `REACT_APP_API_URL`: Paste your **Render Backend URL** here (e.g., `https://quikcort-api.onrender.com/api`).
        - **Note**: Make sure to append `/api` if your backend routes are prefixed with it (which they are).

4.  **Deploy**:
    - Click **Deploy**.
    - Vercel will build and deploy your site.

---

## Part 3: Final Configuration

1.  **Update Backend CORS**:
    - Go back to your **Render** dashboard.
    - Update the `FRONTEND_URL` environment variable with your new **Vercel Frontend URL** (e.g., `https://quikcort.vercel.app`).
    - Render will automatically redeploy.

2.  **Test**:
    - Open your Vercel URL.
    - Try logging in or creating a case to verify the connection to the backend.

## Troubleshooting

- **CORS Errors**: Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slash usually).
- **Connection Refused**: Ensure `REACT_APP_API_URL` in Vercel is correct and includes `/api`.
- **Build Fails**: Check the build logs in Vercel/Render for specific error messages.
