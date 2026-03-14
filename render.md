# YT Downloader Pro: Render Deployment Guide

Follow these steps to deploy this application to [Render](https://render.com).

## 1. Prepare your Repository
Ensure your code is pushed to a GitHub or GitLab repository.

## 2. Create a Web Service on Render
1. Log in to your Render dashboard.
2. Click **New +** and select **Web Service**.
3. Connect your repository.

## 3. Configuration Settings
- **Runtime**: `Docker` (This ensures FFmpeg is available)
- **Repo Name**: `yt-downloader-pro` (or your repo name)
- **Branch**: `main`
- **Region**: Choose the one closest to you.

## 4. Resource Settings
- **Instance Type**: `Starter` (recommended, as video/audio merging requires some CPU/Memory)

## 5. Deployment
Render will automatically build your Docker container using the provided `Dockerfile`. This will install Node.js and the necessary FFmpeg binaries required for the application to function.

## 6. Accessing the App
Once the build is complete, Render will provide a URL like `https://yt-downloader-pro.onrender.com`.

> [!NOTE]
> The application uses a local `downloads` folder. On Render's free/standard disk, files will be lost when the service restarts. For persistent storage, you would need to attach a **Render Disk**.
