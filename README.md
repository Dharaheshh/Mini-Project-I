# Smart College Damage Reporting System

A MERN-based application for reporting and managing college infrastructure issues with image uploads, location-aware complaints, status tracking, and an administrative dashboard.

## Features

- 🔐 User registration and authentication
- 📸 Image-based damage reporting
- 📍 Location-aware complaint submission
- 📋 Complaint status tracking
- 🧑‍💼 Admin dashboard with filters
- 🏷️ Category and priority management
- ☁️ Cloudinary image storage

## Planned AI Extensions

The project roadmap includes damage classification, severity and priority prediction, duplicate complaint detection, and automated descriptions.

## Tech Stack

**Frontend:** React, Tailwind CSS, Zustand, Chart.js  
**Backend:** Node.js, Express.js, MongoDB, JWT  
**Media:** Cloudinary  
**Planned AI:** Python, PyTorch, FastAPI

## Architecture

```text
React Frontend
      ↓
Node.js + Express API
      ↓
MongoDB
      ↘
     Cloudinary
```

## Project Structure

```text
Mini-Project-I/
├── frontend/
├── backend/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 14+
- MongoDB or MongoDB Atlas
- Cloudinary account

### Setup

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

Configure the required environment variables for MongoDB, JWT, Cloudinary, and the frontend API URL, then start the frontend and backend services.

> Academic mini-project demonstrating full-stack development, authentication, media handling, and workflow-based issue management.
