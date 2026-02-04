# 🏢 SponsorshipHub

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![Status](https://img.shields.io/badge/status-active-success.svg) ![License](https://img.shields.io/badge/license-ISC-green.svg)

> A centralized **Full Stack Web Application** for tracking sponsorship records, managing vendor data, and analyzing departmental spending with real-time risk detection.

---

## 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Database Configuration](#-database-configuration)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)

---

## 🚀 About the Project
**SponsorshipHub** digitizes the sponsorship tracking process at IOCL. It replaces manual methods with a unified platform offering:
- **Centralized Data:** One dashboard for all sponsorship activities.
- **Historical Integrity:** "Snapshot Logic" freezes employee details at the time of entry.
- **Risk Analysis:** Auto-detection of conflicting vendor events to prevent overlaps.

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) |
| **Backend** | ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) ![ExpressJS](https://img.shields.io/badge/Express.js-404D59?style=flat) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) |

---

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/SponsorshipHub.git
cd SponsorshipHub
2. Install Client Dependencies (Frontend)
cd client
npm install
3. Build Client
npm run build
4. Install Server Dependencies (Backend)
cd ../server
npm install
🗄 Database Configuration
1. Create a PostgreSQL Database
Create a new PostgreSQL database (example name: sponsorshiphub).

2. Run SQL Scripts
Run the provided SQL scripts to create the required tables:

employee_master

vendors

sponsorships

✅ Make sure the database tables are created successfully before starting the server.

🔐 Environment Variables
Inside the server/ folder create the following files:

.env (Development)

.env.uat (User Acceptance Testing)

.env.production (Production)

Add your database credentials to each file.

Example:

DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_HOST=localhost
DB_PORT=5432
▶️ Running the App
Run the following commands inside the server/ folder:

✅ Development Mode
npm start
✅ UAT Mode
npm run start:uat
✅ Production Mode
npm run start:prod
🌐 Access the Application
Open the application in your browser:

http://localhost:5000
