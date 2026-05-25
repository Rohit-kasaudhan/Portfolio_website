# ⚡ Rohit Kasaudhan — Portfolio Website

> AI/ML Engineer • Full-Stack Developer • CSE Student at KIIT University

🌐 **Live Website:** [https://rohitkasaudhan.com.np](https://rohitkasaudhan.com.np)
📧 **Email:** [ksdrohit28@gmail.com](mailto:ksdrohit28@gmail.com)
💼 **LinkedIn:** [https://linkedin.com/in/rohit-kasaudhan](https://linkedin.com/in/rohit-kasaudhan)
🐙 **GitHub:** [https://github.com/Rohit-kasaudhan](https://github.com/Rohit-kasaudhan)

---

## 📌 Overview

This repository contains my personal portfolio website built to showcase:

* 🚀 Projects & technical work
* 🧠 AI/ML experience
* 💼 Services & skills
* 📄 Resume & achievements
* ⚡ An AI-powered chatbot assistant using RAG architecture

The project combines a modern frontend with a FastAPI backend integrated with Gemini AI and Supabase vector search.

---

# ✨ Features

## 🎨 Portfolio Website

* Responsive modern UI
* Smooth animations & interactive sections
* Project showcase with tech stack details
* Skills, services, and experience sections
* Contact & social integration

## 🤖 AI Chatbot — Pikachu ⚡

* Conversational AI assistant
* Retrieval-Augmented Generation (RAG)
* Context-aware responses
* Streaming responses using Server-Sent Events (SSE)
* Fast semantic search using vector embeddings

## ⚙️ Backend Features

* FastAPI REST APIs
* Gemini AI integration
* Supabase pgvector support
* Async processing
* Optimized response streaming

---

# 🛠 Tech Stack

| Category   | Technologies                             |
| ---------- | ---------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS |
| Backend    | FastAPI, Python                          |
| AI Model   | Gemini 2.5 Flash                         |
| Embeddings | Gemini Embedding API                     |
| Database   | Supabase PostgreSQL + pgvector           |
| Streaming  | Server-Sent Events (SSE)                 |
| Deployment | Vercel (Frontend), Render (Backend)      |

---

# 📁 Project Structure

```bash
rohit-portfolio/
│
├── frontend/              # React + Vite portfolio frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/               # FastAPI RAG chatbot backend
│   ├── app/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── requirements.txt
│
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Rohit-kasaudhan/rohit-portfolio.git
cd rohit-portfolio
```

---

# 🔧 Backend Setup

## Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Configure Environment Variables

Create a `.env` file inside the backend folder:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

## Run Backend Server

```bash
uvicorn main:app --reload
```

Backend will run at:

```bash
http://127.0.0.1:8000
```

---

# 💻 Frontend Setup

## Install Dependencies

```bash
cd frontend
npm install
```

## Start Development Server

```bash
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

# 🧠 RAG Chatbot Architecture

The chatbot uses a Retrieval-Augmented Generation pipeline:

```text
User Query
   ↓
Embedding Generation
   ↓
Supabase Vector Search
   ↓
Context Retrieval
   ↓
Gemini 2.5 Flash
   ↓
Streaming Response (SSE)
```

### Key Components

* **Gemini Embeddings** for semantic search
* **pgvector** for vector similarity search
* **FastAPI SSE** for real-time response streaming
* **Gemini Flash** for fast conversational generation

---

# 📦 Environment Variables

| Variable         | Description           |
| ---------------- | --------------------- |
| `SUPABASE_URL`   | Supabase project URL  |
| `SUPABASE_KEY`   | Supabase API key      |
| `GEMINI_API_KEY` | Google Gemini API key |

---

# 🌍 Deployment

## Frontend

Deployed on:

* **Vercel**

## Backend

Deployed on:

* **Render**

---

# 📸 Screenshots

> <img width="1919" height="948" alt="image" src="https://github.com/user-attachments/assets/f1d547ab-e6e9-41f4-a0b0-c2fc4b9ae9a1" />
**AGENT**
> <img width="1919" height="948" alt="image" src="https://github.com/user-attachments/assets/deb83ba8-9fc6-4571-89c9-0b915ad6c3c8" />







# 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

```bash
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request
```

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

## Rohit Kasaudhan

AI/ML Engineer & Full-Stack Developer passionate about building scalable AI-powered applications.

* 🌐 Website: [https://rohitkasaudhan.com.np](https://rohitkasaudhan.com.np)
* 💼 LinkedIn: [https://linkedin.com/in/rohit-kasaudhan](https://linkedin.com/in/rohit-kasaudhan)
* 🐙 GitHub: [https://github.com/Rohit-kasaudhan](https://github.com/Rohit-kasaudhan)
* 📧 Email: [ksdrohit28@gmail.com](mailto:ksdrohit28@gmail.com)

---

# ⭐ Support

If you like this project, consider giving it a star on GitHub ⭐
