# 🏋️ Smart Gym Tracker

A full-stack fitness management platform designed for gym members, trainers, and administrators.

Smart Gym Tracker digitizes gym operations by combining membership management, attendance tracking, workout programming, nutrition monitoring, trainer management, and member engagement into a unified system.

---

## 📖 Overview

Managing gym operations manually often leads to inefficient member tracking, poor attendance monitoring, and limited visibility into member progress.

Smart Gym Tracker provides a centralized platform that enables:

- Gym member management
- Trainer assignment and monitoring
- Workout program creation
- Nutrition tracking
- Attendance management
- Membership plan administration
- Reporting and notifications

---

## 🎯 Key Features

### 👤 Member Management

- Member registration
- Profile management
- Membership activation
- Membership renewal
- Membership status tracking
- Profile image uploads

---

### 🏋️ Workout Programs

- Create workout programs
- Assign programs to members
- Exercise management
- Progress monitoring
- Program history

---

### 🧑‍🏫 Trainer Management

- Trainer registration
- Trainer assignment
- Member-trainer relationships
- Trainer dashboard
- Program supervision

---

### 🍎 Nutrition Tracking

- Meal logging
- Nutrition records
- Daily tracking
- Progress monitoring

---

### 📅 Attendance Tracking

- Member check-in/check-out
- Attendance scanner
- Attendance history
- Daily attendance monitoring

---

### 💳 Membership Plans

- Multiple membership plans
- Plan activation
- Start and expiry dates
- Membership lifecycle management
- Payment tracking

---

### 📧 Notifications & Communication

- Email notifications
- Membership alerts
- User updates
- Automated communication

---

### 📄 Reports & Documents

- PDF generation
- Member reports
- Attendance reports
- Membership summaries

---

## 🏗️ System Architecture

```text
                         ┌──────────────────┐
                         │      Admin       │
                         └────────┬─────────┘
                                  │
                                  ▼

┌─────────────┐          ┌──────────────────┐          ┌─────────────┐
│   Members   │ ───────► │   Smart Gym      │ ◄────── │  Trainers   │
└─────────────┘          │    Tracker       │          └─────────────┘
                         └────────┬─────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │  Express Backend │
                        └────────┬─────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   PostgreSQL     │
                        │    Database      │
                        └──────────────────┘
```

---

## 👥 User Roles

### Member

Members can:

- Track attendance
- View assigned workout programs
- Track nutrition
- Manage profile information
- View progress

### Trainer

Trainers can:

- Create workout programs
- Manage assigned members
- Monitor member progress
- Assign exercises

### Administrator

Administrators can:

- Manage memberships
- Manage trainers
- Manage members
- Monitor attendance
- Configure plans
- Generate reports

---

## 🗄️ Database Modules

### Core Entities

- Users
- Members
- Trainers
- Membership Plans
- Attendance
- Programs
- Program Exercises
- User Programs
- Nutrition Records

---

## 🛠️ Tech Stack

### Frontend

- React
- React Router
- JavaScript
- CSS

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Sequelize ORM

### Authentication

- JWT Authentication
- Protected Routes
- Role-Based Access Control

### Additional Services

- Email Services
- PDF Generation
- File Uploads

### Deployment

- Docker

---

## 📂 Project Structure

```text
smart-gym-tracker/

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── routes/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── migrations/
│   ├── seeders/
│   └── uploads/
│
└── README.md
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/your-username/smart-gym-tracker.git
cd smart-gym-tracker
```

---

### Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_gym
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret
```

Run migrations:

```bash
npx sequelize-cli db:migrate
```

Start server:

```bash
npm start
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Role-Based Access Control
- Input Validation

---

## 📈 Future Enhancements

### AI Features

- AI Workout Recommendations
- AI Nutrition Suggestions
- Personalized Fitness Insights

### Mobile Features

- React Native Mobile App
- Push Notifications
- QR Attendance Scanner

### Integrations

- Wearable Device Integration
- Payment Gateway Integration
- SMS Notifications

### Analytics

- Member Retention Analysis
- Attendance Analytics
- Workout Performance Metrics
- Nutrition Trends Dashboard

---

## 🎓 Learning Outcomes

This project demonstrates:

- Full-Stack Development
- REST API Design
- Authentication & Authorization
- Database Design
- Role-Based Access Control
- File Upload Management
- Email Services
- PDF Generation
- Dockerized Deployment
- Software Architecture Design

---

## 👨‍💻 Author

**Ahamed Rilwan**

GitHub: https://github.com/ahamril2265

LinkedIn: https://www.linkedin.com/in/ahamedrilwan
