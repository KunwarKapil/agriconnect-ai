# 🌾 AgriConnect AI – Smart Agriculture Management Platform

## Overview

AgriConnect AI is a full-stack agriculture management platform developed as part of the **SIP 2026 AI-Assisted Full Stack Web Development Program**.

The application helps farmers and agricultural organizations manage farmer directories, crop lifecycles, and weather metrics through a modern web interface. It combines a React frontend with a FastAPI backend, MongoDB Atlas for cloud persistence, secure JWT authentication, Google Gemini AI for intelligent crop advisory, and OpenWeather API for real-time meteorological insights.

---

# Features

## Authentication & Security

- User Registration & Login with JWT Tokens
- Password Hashing using bcrypt
- Protected Frontend Routes (`ProtectedRoute`)
- Protected Backend APIs with `Depends(verify_token)`
- Session Persistence in localStorage
- React `ErrorBoundary` component to prevent white screen crashes

---

## Farmer Management

- View Farmers Directory
- Add / Register Farmer with input validation
- Edit Farmer details
- Custom Delete Confirmation Modal (`ConfirmDialog`)
- Case-insensitive Farmers Search
- MongoDB Atlas Persistence
- Modern Empty State handling

---

## Crop Management

- View Crops Directory
- Add / Register Crop with season, schedule, and area validation
- Edit Crop details & status badges (Planted, Growing, Ready for Harvest, Harvested)
- Custom Delete Confirmation Modal (`ConfirmDialog`)
- Case-insensitive Crops Search
- Modern Empty State handling

---

## Weather Monitoring & Live OpenWeather Integration

- **Live Weather Feature**: Real-time OpenWeather metrics via FastAPI proxy (`/api/weather/live`)
  - Displays: Current Temp, Feels Like, Humidity, Pressure, Wind Speed, Visibility, Cloud %, Weather Condition, Icon, City, Country, and Timestamp
- **Weather CRUD Records**: Manual regional meteorological record tracking (Create, Read, Update, Delete)
- Custom Delete Confirmation Modal (`ConfirmDialog`)
- Search records by location name

---

## Production Dashboard

- Modern responsive card layout
- Real-Time Summary Statistics (Farmers, Crops, Weather Locations, AI Model status)
- **Live OpenWeather Widget**: Live meteorological metrics with city switcher
- **System Health Monitor**: Real-time backend status, MongoDB connection ping, AI engine state, and OpenWeather status (`/api/system/status`)
- **Quick AI Advisor Launcher** & **Recent System Activity Feed**

---

## Enhanced AI Farm Advisor (Gemini AI + Live Weather)

- Google Gemini 3.5 Flash Integration with live weather context
- **Auto-Fill Live Weather**: One-click sync populates temperature, humidity, and weather condition directly into diagnostic form
- Structured 6-Section Diagnostic Report rendering:
  1. **Problem Analysis**
  2. **Possible Causes**
  3. **Treatment & Immediate Actions**
  4. **Fertilizer & Nutrient Suggestions**
  5. **Prevention Tips & Care**
  6. **Agricultural Disclaimer**
- Animated loading indicators & error handling toasts

---

# Tech Stack

## Frontend

- **React** (v18+)
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling System)
- **React Router DOM** (Client-side Routing)
- **Axios & Fetch API** (HTTP Client)

## Backend

- **FastAPI** (Python Asynchronous Web Framework)
- **Uvicorn** (ASGI Server)
- **PyMongo** (MongoDB Driver)
- **PyJWT & bcrypt** (Security)

## Database

- **MongoDB Atlas** (Cloud NoSQL Database)

## AI & Third-Party APIs

- **Google Gemini 3.5 Flash API** (Generative AI Diagnostics)
- **OpenWeather API** (Real-Time Meteorological Data)

---

# Comprehensive Project Structure

```text
agriconnect-ai/
│
├── backend/                             # FastAPI Python Backend Application
│   ├── database/                        # Database Connection & Seed Layer
│   │   └── connection.py                # PyMongo MongoDB Atlas Client & Auto-Seeding
│   ├── middleware/                      # Security & Auth Middleware
│   │   └── auth.py                      # JWT Bearer Token Verification Middleware
│   ├── models/                          # Pydantic Schemas & Data Models
│   │   ├── user.py                      # User Authentication Schemas
│   │   ├── farmer.py                    # Farmer Directory Schemas
│   │   ├── crop.py                      # Crop Management Schemas
│   │   └── weather.py                   # Weather Record Schemas
│   ├── routes/                          # FastAPI Router Endpoints
│   │   ├── ai.py                        # Gemini AI Advisor Endpoints
│   │   ├── auth.py                      # User Registration & Login Endpoints
│   │   ├── crops.py                     # Crop CRUD & Search Endpoints
│   │   ├── farmers.py                   # Farmer CRUD & Search Endpoints
│   │   └── weather.py                   # Live OpenWeather & Weather CRUD Endpoints
│   ├── services/                        # Business Logic & Database Service Layer
│   │   ├── auth.py                      # Auth & Password Hashing Logic
│   │   ├── crop.py                      # Crop Database Operations
│   │   ├── farmer.py                    # Farmer Database Operations
│   │   └── weather.py                   # Weather Database Operations
│   ├── utils/                           # Helper Utilities
│   │   └── security.py                  # JWT Token Generation & bcrypt Hashing
│   ├── .env                             # Environment Variables (Secrets)
│   ├── .env.example                     # Environment Variables Template
│   ├── .gitignore                       # Backend Git Ignore Rules
│   ├── config.py                        # Application Settings & Configuration
│   ├── main.py                          # FastAPI App Entrypoint & CORS Rules
│   └── requirements.txt                 # Python Dependencies Specification
│
├── frontend/                            # React + Vite Client Application
│   ├── public/                          # Static Assets & Public Files
│   ├── src/                             # Application Source Code
│   │   ├── components/                  # Shared Component Library
│   │   │   ├── ui/                      # Reusable UI Primitives
│   │   │   │   ├── Button.jsx           # Button with Loading Spinner Support
│   │   │   │   ├── Card.jsx             # Card Wrapper Component
│   │   │   │   ├── ConfirmDialog.jsx    # Custom Delete Confirmation Modal
│   │   │   │   ├── EmptyState.jsx       # Reusable Empty State Illustration View
│   │   │   │   ├── Input.jsx            # Form Input Field with Validation
│   │   │   │   ├── Loader.jsx           # Animated Loading Spinner Component
│   │   │   │   ├── Modal.jsx            # Modal Dialog Container
│   │   │   │   ├── ThemeToggle.jsx      # Dark/Light Theme Toggle Switch
│   │   │   │   ├── Toast.jsx            # Notification Toast (Success/Error/Info)
│   │   │   │   └── index.js             # UI Component Barrel Exports
│   │   │   ├── ErrorBoundary.jsx        # React Fallback Error Boundary
│   │   │   ├── Footer.jsx               # Application Footer Component
│   │   │   ├── Hero.jsx                 # Landing Page Hero Section
│   │   │   ├── Navbar.jsx               # Top Navigation Bar & User Actions
│   │   │   └── ProtectedRoute.jsx       # Route Guard checking JWT Auth
│   │   ├── context/                     # React Context Providers
│   │   │   ├── AuthContext.jsx          # Auth State & Token Management
│   │   │   └── ThemeContext.jsx         # Dark/Light Theme Context
│   │   ├── pages/                       # Application Views & Pages
│   │   │   ├── AIAdvisor.jsx            # Weather-Aware Gemini AI Advisor Page
│   │   │   ├── About.jsx                # About Platform Page
│   │   │   ├── ComponentsDemo.jsx       # UI Component Showcase Demo
│   │   │   ├── Crops.jsx                # Crop Management Page (CRUD)
│   │   │   ├── Dashboard.jsx            # Production Command Center Dashboard
│   │   │   ├── Farmers.jsx              # Farmer Directory Page (CRUD)
│   │   │   ├── Home.jsx                 # Landing Home Page
│   │   │   ├── Login.jsx                # User Login Page
│   │   │   ├── Register.jsx             # User Registration Page
│   │   │   └── Weather.jsx              # Weather Page (Live + Manual CRUD)
│   │   ├── App.css                      # App Utility Styles
│   │   ├── App.jsx                      # Main Router & Error Boundary Setup
│   │   ├── index.css                    # Tailwind CSS Base & Theme Directives
│   │   └── main.jsx                     # React Client Entrypoint
│   ├── eslint.config.js                 # ESLint Linting Configuration
│   ├── index.html                       # HTML Template
│   ├── package.json                     # Frontend Node Dependencies
│   ├── tailwind.config.js               # Tailwind Custom Configuration
│   └── vite.config.js                   # Vite Bundler Settings
│
└── README.md                            # Comprehensive Platform Documentation
```

---

# Available API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register User Account |
| POST | /api/auth/login | Authenticate User & Obtain JWT |

## Farmers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/farmers | Get All Farmers |
| POST | /api/farmers | Add Farmer Record |
| PUT | /api/farmers/{id} | Update Farmer Record |
| DELETE | /api/farmers/{id} | Delete Farmer Record |
| GET | /api/farmers/search | Search Farmers by Name |

## Crops

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/crops | Get All Crops |
| POST | /api/crops | Register New Crop |
| PUT | /api/crops/{id} | Update Crop Record |
| DELETE | /api/crops/{id} | Delete Crop Record |
| GET | /api/crops/search | Search Crops by Name |

## Weather & Live OpenWeather API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/weather/live | Fetch Real-Time OpenWeather Metrics (`city`) |
| GET | /api/weather | Get Manual Weather Records |
| POST | /api/weather | Create Weather Record |
| PUT | /api/weather/{id} | Update Weather Record |
| DELETE | /api/weather/{id} | Delete Weather Record |
| GET | /api/weather/search | Search Weather Records by Location |

## AI Advisor & System Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/advisor | Weather-Aware Gemini Crop Advisor |
| GET | /api/system/status | System Health & MongoDB Status |

---

# Getting Started

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas Cluster
- Google Gemini API Key
- OpenWeather API Key

---

## 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# Install requirements
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

FastAPI server runs at `http://127.0.0.1:8000`.  
Swagger Docs at `http://127.0.0.1:8000/docs`.

---

## 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend application runs at `http://localhost:5173`.

---

# Current Development Progress

## ✅ Completed (Weeks 1 – 8)

- React + Vite Setup & Tailwind CSS Design System
- FastAPI Backend Architecture & PyMongo Connection Layer
- MongoDB Atlas Persistent Cloud Storage & Auto-Increment Counters
- JWT Token Authentication & Protected Client Routes
- **Week 8 Accomplishments**:
  - Live OpenWeather API Integration (`/api/weather/live`)
  - Weather-Aware Google Gemini AI Advisor
  - Production Dashboard & Live System Health Monitor (`/api/system/status`)
  - React `ErrorBoundary` Component
  - Custom `ConfirmDialog` Modal Component
  - Reusable `EmptyState` Component
  - Submit Button Loading Spinners & Toast Variants
  - Responsive Layout verified across 375px, 768px, 1440px

---

# Developer

**Kunwar Kapil Singh Karki**  
B.Tech Computer Science  
Graphic Era Hill University  
SIP 2026 – AI-Assisted Full Stack Web Development Program  

---

# License

This project is developed for educational and internship demonstration purposes as part of the **SIP 2026 Internship Program**.