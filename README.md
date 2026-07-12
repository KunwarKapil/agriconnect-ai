# 🌾 AgriConnect AI – Smart Agriculture Management Platform

## Overview

AgriConnect AI is a full-stack agriculture management platform developed as part of the **SIP 2026 AI-Assisted Full Stack Web Development Program**.

The application helps farmers and agricultural organizations manage farmer records, crop information, and weather data through a modern web interface. It combines a React frontend with a FastAPI backend, MongoDB Atlas for persistent storage, and secure JWT-based authentication. The platform is designed to be scalable and will later integrate Google Gemini AI for intelligent farming recommendations.

---

# Features

## Authentication & Security

- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Frontend Routes
- Protected Backend APIs
- Logout Functionality
- Session Persistence using localStorage

---

## Farmer Management

- View Farmers
- Add Farmer
- Edit Farmer
- Delete Farmer
- Search Farmers
- MongoDB Persistence

---

## Crop Management

- View Crops
- Add Crop
- Edit Crop
- Delete Crop
- Search Crops

---

## Weather Monitoring

- View Weather Records
- Add Weather Record
- Edit Weather Record
- Delete Weather Record
- Search Weather by Location

---

## Dashboard

- Farmer Directory
- Crop Management
- Weather Monitoring
- Responsive Design
- Dark / Light Theme

---

## Future Features

- AI Farm Advisor using Google Gemini
- Crop Disease Detection & Prevention
- Live Weather API Integration
- Reports & Analytics
- Role-Based Access Control
- Google OAuth Authentication

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend

- FastAPI
- Python
- Uvicorn

## Database

- MongoDB Atlas
- PyMongo

## Authentication

- JWT (JSON Web Token)
- bcrypt Password Hashing

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# Project Structure

```text
agriconnect-ai/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

# Getting Started

## Prerequisites

Install the following software:

- Python 3.11+
- Node.js 18+
- npm
- Git

---

# Backend Setup

Navigate to the backend directory.

```bash
cd backend
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate the environment.

### Windows PowerShell

```bash
.\venv\Scripts\Activate.ps1
```

### Windows CMD

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the FastAPI server.

```bash
uvicorn main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=agriconnect_db
JWT_SECRET=your_secret_key
```

---

# Database Setup

The project uses **MongoDB Atlas** as the primary cloud database.

## Setup Steps

1. Create a free MongoDB Atlas cluster.
2. Create a Database User.
3. Add your IP under Network Access.
4. Copy the MongoDB connection string.
5. Create a `.env` file.
6. Configure the required environment variables.

---

# Database Collections

- users
- farmers
- crops
- weather
- counters

The `counters` collection is used to maintain auto-increment integer IDs.

---

# Database Schema Diagram

![Database Schema](./W5_SchemaDiagram_TBI-26100336.png)

---

# Authentication Flow

```text
User Registration
        │
        ▼
Password hashed using bcrypt
        │
        ▼
Stored securely in MongoDB
        │
        ▼
User Login
        │
        ▼
JWT Generated
        │
        ▼
Saved in localStorage
        │
        ▼
Protected Routes Accessible
        │
        ▼
Logout
```

---

# Available API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | User Login |

---

## Farmers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/farmers | Get All Farmers |
| POST | /api/farmers | Add Farmer |
| PUT | /api/farmers/{id} | Update Farmer |
| DELETE | /api/farmers/{id} | Delete Farmer |
| GET | /api/farmers/search | Search Farmers |

---

## Crops

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/crops | Get All Crops |
| POST | /api/crops | Add Crop |
| PUT | /api/crops/{id} | Update Crop |
| DELETE | /api/crops/{id} | Delete Crop |
| GET | /api/crops/search | Search Crops |

---

## Weather

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/weather | Get Weather Records |
| POST | /api/weather | Add Weather Record |
| PUT | /api/weather/{id} | Update Weather Record |
| DELETE | /api/weather/{id} | Delete Weather Record |
| GET | /api/weather/search | Search Weather |

---

# Screenshots

> Add screenshots of the application here.

- Home Page
- Login Page
- Dashboard
- Farmer Management
- Crop Management
- Weather Monitoring

---

# Current Development Progress

## ✅ Completed (Week 1 – Week 6)

- React + Vite Project Setup
- Tailwind CSS Integration
- Responsive User Interface
- Component Library
- React Router
- Dark / Light Theme
- FastAPI Backend
- Farmer CRUD Module
- Crop CRUD Module
- Weather CRUD Module
- Dashboard
- Frontend–Backend Integration
- MongoDB Atlas Integration
- Persistent CRUD Operations
- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Frontend Routes
- Protected Backend APIs
- Logout Functionality

---

## 🚧 Upcoming Features

- AI Farm Advisor (Google Gemini)
- Crop Disease Detection
- Live Weather API Integration
- Analytics Dashboard
- Role-Based Access Control
- Google OAuth Authentication
- Deployment to Vercel & Render

---

# Developer

**Kunwar Kapil Singh Karki**

B.Tech Computer Science

Graphic Era Hill University

SIP 2026 – AI-Assisted Full Stack Web Development

---

# License

This project is developed for educational purposes as part of the **SIP 2026 Internship Program**.