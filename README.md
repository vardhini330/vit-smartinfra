# 🏙️ SmartInfra  
### Smart Infrastructure Management System

🔗 **Live Deployment:**  
https://vit-smartinfra--sriv99135.replit.app

---

# 📌 1. Project Overview

SmartInfra is a full-stack web application developed to manage and monitor smart city infrastructure efficiently. The system enables administrators and government officials to manage assets, track complaints, monitor audits, and analyze system data through a centralized dashboard.

This project demonstrates complete full-stack architecture using modern web technologies including:

- Vite (Frontend)
- Node.js & Express (Backend)
- MongoDB (Database)
- REST API Integration

The application is fully deployed and accessible online.

---

# 🎯 2. Problem Statement

Managing city infrastructure manually leads to:

- Poor asset tracking
- Delayed complaint resolution
- Lack of transparency
- No centralized monitoring
- No audit tracking
- Inefficient data handling

There is a need for a digital system that:

- Centralizes infrastructure management
- Tracks complaints efficiently
- Provides analytics and dashboards
- Ensures secure role-based access

SmartInfra solves these challenges by providing a structured digital platform.

---

# 🚀 3. Key Features

## 🔐 Authentication & Role-Based Access
- Secure login system
- Role-based permissions
- Super Admin auto-creation
- Protected API routes

## 🏗️ Asset Management
- Add new infrastructure assets
- Update asset details
- Delete assets
- Upload related documents/images
- Track asset status

## 📢 Complaint Management
- Register complaints
- Assign to officials
- Track complaint progress
- Update complaint resolution status

## 📊 Dashboard & Analytics
- View total assets
- View complaint statistics
- Activity tracking
- Administrative insights

## 🧾 Audit Tracking
- Track system activities
- Monitor changes
- Maintain accountability logs

---

# 🛠️ 4. Technology Stack

## Frontend
- Vite
- JavaScript
- REST API Integration

## Backend
- Node.js
- Express.js
- ES Modules
- CORS Configuration
- Error Handling Middleware

## Database
- MongoDB
- Mongoose ORM
- MongoDB Memory Server (Development)

---

# 🏗️ 5. System Architecture

Client (Vite Frontend)
↓
Express Backend (API Layer)
↓
MongoDB Database


The backend handles:
- API routing
- Authentication
- Database operations
- File uploads
- Error handling

---

# 📂 6. Project Structure


vit-smartinfra/
│
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── assets.js
│   │   ├── complaints.js
│   │   ├── audit.js
│   │   ├── analytics.js
│   │   ├── admin.js
│   │   ├── dashboard.js
│   │
│   ├── models/
│   ├── uploads/
│   ├── index.js
│
├── client/ (Vite Frontend)
│   ├── src/
│   ├── dist/
│
├── package.json
└── README.md



# ⚙️ 7. Installation & Setup (Local Development)

## Step 1: Clone Repository

bash
git clone <repository-url>
cd vit-smartinfra

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start Development Server

```bash
npm run dev
```

Server runs on:

```
http://localhost:8000
```

---

# 🌐 8. Deployment

The application is deployed using Replit.

Live Deployment Link:

https://vit-smartinfra--sriv99135.replit.app

The backend serves the frontend build files and handles API routes under `/api`.

---

# 🔐 9. Default Super Admin Credentials

Email: superadmin@city.gov
Password: SuperAdmin123!

For user 

Email: you@gmail.com
Password: vardhini

For offical

Email: siva@gmail.com
Password: vardhini

⚠️ For demonstration purposes only.

---

# 🔄 10. API Endpoints

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | /api/auth/login    | User Login         |
| POST   | /api/auth/register | Register User      |
| GET    | /api/assets        | Get All Assets     |
| POST   | /api/assets        | Add Asset          |
| GET    | /api/complaints    | Get Complaints     |
| POST   | /api/complaints    | Add Complaint      |
| GET    | /api/dashboard     | Get Dashboard Data |

---

# 🔒 11. Security Features

* CORS configuration
* Error handling middleware
* Role-based route protection
* Environment-based configuration
* Input validation

---

# 📊 12. Database Handling

* Uses MongoDB via Mongoose
* Automatically creates default Super Admin
* Supports both:

  * MongoDB Memory Server (Development)
  * MongoDB Atlas (Production)

---

# 🌍 13. Environment Variables

Create `.env` file for production:


PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=your_frontend_url


# 🎓 14. Learning Outcomes

Through this project:

* Implemented full-stack architecture
* Understood REST API design
* Configured CORS handling
* Managed MongoDB connections
* Handled authentication flow
* Performed live cloud deployment
* Debugged deployment issues

---

# 👨‍💻 15. Developed By

Sri Vardhini S R
Sivabalan S
Jolin A
Swathi S

---

# 📜 16. License

This project is developed for academic and demonstration purposes.

```
