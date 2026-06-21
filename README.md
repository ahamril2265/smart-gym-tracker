# Smart Gym Tracker 🏋️

A full-stack fitness management platform designed for gym members, trainers, and administrators.

The platform combines workout tracking, nutrition management, attendance monitoring, training program management, and membership administration into a single system.

---

## Overview

Smart Gym Tracker helps fitness centers digitize operations while providing members with tools to track progress and achieve their fitness goals.

The platform supports:

- Member Management
- Trainer Management
- Workout Tracking
- Nutrition Tracking
- Attendance Monitoring
- Program Creation
- Progress Analytics
- Membership Plans

---

## User Roles

### Member

- Track workouts
- Log nutrition
- View progress
- Join programs
- Connect with friends

### Trainer

- Create training programs
- Assign workouts
- Monitor client progress

### Administrator

- Manage memberships
- Manage users
- Track attendance
- Configure plans
- Monitor gym operations

---

## Architecture

```text
Members
Trainers
Admins
      │
      ▼
 React Frontend
      │
      ▼
 Express API
      │
      ▼
 Authentication Layer
      │
      ▼
 Business Logic
      │
      ▼
 PostgreSQL Database
```

---

## Features

### Workout Tracking

- Exercise logging
- Workout history
- Progress monitoring

### Nutrition Tracking

- Meal logging
- Daily nutrition records
- Dietary tracking

### Attendance System

- Attendance scanner
- Attendance history
- Visit monitoring

### Training Programs

- Program creation
- Exercise templates
- Trainer assignments

### Membership Management

- Membership plans
- Renewals
- Activation workflow

### Social Features

- Friend system
- User interaction

---

## Tech Stack

| Layer | Technology |
|---------|-----------|
| Frontend | React |
| Backend | Node.js |
| API | Express |
| Database | PostgreSQL |
| ORM | Sequelize |
| Authentication | JWT |
| Deployment | Docker |

---

## Future Enhancements

- Mobile Application
- Push Notifications
- AI Workout Recommendations
- AI Nutrition Planning
- Wearable Integration
- Payment Gateway Integration
