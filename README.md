# 🎓 EduPulse AI – Smart Academic Intelligence Platform

A production-ready, full-stack AI-powered student performance monitoring system.

---

## 📁 Project Structure

```
edupulse/
├── backend/          # Node.js + Express REST API
├── frontend/         # React + Vite + Tailwind CSS
└── ai-service/       # Python + Flask AI microservice
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Python** 3.9+
- **MongoDB** (local or MongoDB Atlas)
- **npm** v9+

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create / edit `.env` (already provided):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/edupulse
JWT_SECRET=edupulse_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
FLASK_URL=http://localhost:5001
```

Start the server:
```bash
npm run dev
```
✅ Backend runs at `http://localhost:5000`

Seed demo data:
```bash
npm run seed
```

---

### 2. AI Microservice Setup

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```
✅ AI Service runs at `http://localhost:5001`

Test it directly:
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"avg_marks":65,"attendance":80,"improvement_rate":70}'
```

Expected response:
```json
{
  "performance_score": 65.0,
  "learner_category": "Average Learner",
  "risk_level": "Medium",
  "recommendation": "Good effort! Focus on your weaker subjects..."
}
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs at `http://localhost:5173`

---

## 🔐 Demo Credentials (after seeding)

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Teacher | teacher@edupulse.com     | teacher123  |
| Student | alex@edupulse.com        | student123  |
| Student | priya@edupulse.com       | student123  |
| Student | marcus@edupulse.com      | student123  |
| Student | ritika@edupulse.com      | student123  |
| Student | david@edupulse.com       | student123  |

---

## 🤖 AI Formula

```
Performance Score = (0.6 × avg_marks) + (0.3 × attendance) + (0.1 × improvement_rate)

Learner Category:
  score ≥ 75 → Fast Learner
  score ≥ 50 → Average Learner
  score < 50 → Slow Learner

Risk Level:
  score ≥ 75 → Low
  score ≥ 50 → Medium
  score < 50 → High
```

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| POST   | /api/auth/register    | Register user    |
| POST   | /api/auth/login       | Login user       |
| GET    | /api/auth/me          | Current user     |

### Student (JWT required, role: student)
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/student/performance  | My performance data  |
| GET    | /api/student/teachers     | List of teachers     |

### Teacher (JWT required, role: teacher)
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/teacher/students           | All students + data      |
| GET    | /api/teacher/students/:id       | Single student           |
| PUT    | /api/teacher/students/:id       | Update marks + trigger AI|
| GET    | /api/teacher/analytics          | Class analytics          |

### Messages (JWT required)
| Method | Endpoint                   | Description             |
|--------|----------------------------|-------------------------|
| POST   | /api/messages              | Send message            |
| GET    | /api/messages              | My conversation list    |
| GET    | /api/messages/:otherUserId | Get conversation        |

---

## 🛠 Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 19, Vite 7, Tailwind CSS v4, Framer Motion, Recharts |
| Backend    | Node.js, Express, JWT, bcryptjs, Mongoose   |
| Database   | MongoDB                                     |
| AI Service | Python 3, Flask, scikit-learn, pandas       |

---

## 🔧 Development Tips

- Run **all three services** simultaneously in separate terminals.
- The Vite dev server proxies `/api` requests to `localhost:5000` automatically.
- If the AI service is offline when a teacher saves data, the backend gracefully skips AI analysis (no crash).
- Messages auto-poll every 5 seconds in the chat component.
