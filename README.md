# Inventory & Order Management System

A full-stack web application designed to manage products, customers, and order processing efficiently. Built with a robust FastAPI backend and a responsive React frontend, containerized for seamless deployment.

## 🚀 Live Demo
[https://inventory-system-omega-three.vercel.app]

## 🛠 Tech Stack
* **Backend:** FastAPI, Python, SQLAlchemy
* **Database:** PostgreSQL
* **Frontend:** React, Vite, Axios
* **Infrastructure:** Docker, Docker Compose, Render (Backend), Vercel (Frontend)

## Key Features
* **Inventory Management:** Efficiently track product stock levels with automatic reductions during order placement.
* **Order Processing:** Create and manage customer orders with real-time data handling.
* **Data Validation:** Ensures SKU and email integrity with robust error handling.
* **Scalability:** Fully containerized architecture for reliable deployment.

## How to Run Locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/Angshuman26/Inventory-System.git](https://github.com/Angshuman26/Inventory-System.git)
   cd Inventory-System
2. Ensure Docker Desktop is running.
3. Start the application:
   ```bash
   docker compose up --build
4. Access the application:
   Frontend: http://localhost
   Backend API: http://localhost:8000/docs


## Project Structure
```text
Inventory-System/
├── backend/            # FastAPI application & Dockerfile
├── frontend/           # React/Vite application & Dockerfile
├── docker-compose.yml  # Orchestration of services
└── README.md
```
## License
This project is for educational and assessment purposes.
