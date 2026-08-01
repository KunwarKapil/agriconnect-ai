# 🌾 AgriConnect AI – Smart Agriculture Management Platform

An AI-powered Smart Agriculture Management Platform developed as part of the **SIP 2026 AI-Assisted Full Stack Web Development Internship**.

AgriConnect AI helps farmers and agricultural organizations manage farming operations through a modern web application. The platform provides farmer and crop management, live weather monitoring, AI-powered farming recommendations, secure authentication, and a responsive dashboard.

---

# 🚀 Features

## 🔐 Authentication
- User Registration
- Secure Login
- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Session Management

---

## 👨‍🌾 Farmer Management
- Add Farmer
- View Farmers
- Update Farmer Details
- Delete Farmer
- Form Validation
- MongoDB Integration

---

## 🌱 Crop Management
- Add Crop
- View Crop Records
- Update Crop Details
- Delete Crop
- Crop Information Management

---

## 🌦 Weather Monitoring

### Live Weather
- OpenWeather API Integration
- Current Temperature
- Humidity
- Wind Speed
- Pressure
- Weather Description
- Weather Icons
- City & Country Information

### Weather Records
- Add Weather Record
- View Records
- Update Records
- Delete Records

---

## 🤖 AI Farm Advisor
Powered by **Google Gemini AI**

Provides intelligent farming recommendations based on:
- Crop Name
- Crop Problem
- Live Weather Conditions
- Temperature
- Humidity
- Additional Notes

AI generates:
- Problem Analysis
- Possible Causes
- Recommended Treatment
- Fertilizer Suggestions
- Prevention Tips

---

## 📊 Dashboard
- Farmer Statistics
- Crop Statistics
- Live Weather Widget
- Quick AI Advisor Access
- System Status
- Recent Activity
- Responsive Dashboard Layout

---

## 🎨 User Interface
- Responsive Design
- Light / Dark Theme
- Reusable Component Library
- Toast Notifications
- Loader Components
- Confirmation Dialogs
- Empty State Components
- Error Boundary

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend
- FastAPI
- Uvicorn
- Python

## Database
- MongoDB Atlas
- PyMongo

## Authentication
- JWT
- bcrypt

## APIs
- Google Gemini API
- OpenWeather API

## Tools
- Git
- GitHub
- VS Code
- Figma

---

# 📁 Project Structure

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
│   │   ├── App.jsx
│   │   └── main.jsx
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
│   └── requirements.txt
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/KunwarKapil/agriconnect-ai.git
cd agriconnect-ai
```

---

# Backend Setup

```bash
cd backend

python -m venv venv
```

### Activate Virtual Environment

Windows PowerShell

```bash
.\venv\Scripts\Activate.ps1
```

Windows CMD

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

---

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `backend` folder.

```env
MONGO_URI=your_mongodb_connection_string

DATABASE_NAME=agriconnect_db

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

OPENWEATHER_API_KEY=your_openweather_api_key
```

---

# 🌐 API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

## Farmers

```
GET    /api/farmers
POST   /api/farmers
PUT    /api/farmers/{id}
DELETE /api/farmers/{id}
```

## Crops

```
GET    /api/crops
POST   /api/crops
PUT    /api/crops/{id}
DELETE /api/crops/{id}
```

## Weather

```
GET    /api/weather
POST   /api/weather
PUT    /api/weather/{id}
DELETE /api/weather/{id}

GET    /api/weather/live
```

## AI Advisor

```
POST /api/ai/advisor
```

---

# 📈 Development Progress

## ✅ Completed

- React + Vite Setup
- Tailwind CSS Integration
- Responsive UI
- Component Library
- React Router
- Light / Dark Theme
- FastAPI Backend
- MongoDB Atlas Integration
- JWT Authentication
- Farmer CRUD
- Crop CRUD
- Weather CRUD
- Live Weather (OpenWeather API)
- Google Gemini AI Integration
- AI Farm Advisor
- Dashboard
- Frontend–Backend Integration
- Form Validation
- Toast Notifications
- Error Handling
- Empty State Components
- Responsive Design Improvements

---

## 🚀 Future Improvements

- Crop Disease Detection using AI
- Analytics Dashboard with Charts
- Farmer Profile Management
- Notification System
- Image-based Crop Disease Detection
- Role-Based Access Control
- Deployment on Render & Vercel

---

# 📸 Screenshots

You can add project screenshots here.

- Home Page
- Dashboard
- Farmer Management
- Crop Management
- Live Weather
- AI Farm Advisor
- Login Page

---

# 👨‍💻 Developer

**Kunwar Kapil Singh Karki**

B.Tech Computer Science

Graphic Era Hill University

SIP 2026 – AI-Assisted Full Stack Web Development Internship

---

# 📜 License

This project is developed for educational purposes as part of the **SIP 2026 AI-Assisted Full Stack Web Development Internship**.