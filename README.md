# ASTU-Chatbot 🤖

A comprehensive, context-aware chatbot designed to serve as an intelligent assistant for the Adama Science and Technology University (ASTU) community.

## 📋 Table of Contents
- [Overview](#overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Project Architecture](#️-project-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## Overview

The **ASTU-Chatbot** is a sophisticated AI-powered assistant built to enhance the university experience for students, faculty, and staff. It provides instant, accurate responses to academic queries, campus information, administrative procedures, and general university knowledge, available 24/7 through an intuitive web interface.

**Core Purpose**: Streamline information access, reduce administrative bottlenecks, and provide personalized support for the ASTU community.

## ✨ Features

### 💬 Intelligent Conversational Interface
- **Natural Language Processing**: Understands and responds to queries in conversational language
- **Context Awareness**: Maintains conversation context for follow-up questions
- **Multi-turn Dialogues**: Handles complex, multi-step conversations seamlessly

### 🎓 Academic Assistance
- Course information and schedules
- Faculty directory and office hours
- Exam schedules and academic calendars
- Assignment deadlines and submission guidelines

### 🏛️ Campus & Administrative Support
- Campus facility locations and hours
- Administrative procedure guidance
- Event information and announcements
- Library resource assistance

### 🔧 Technical Capabilities
- Real-time response generation
- Session management and history
- Scalable backend architecture
- Responsive, mobile-friendly frontend

## 🛠️ Tech Stack

### Frontend
- **TypeScript** (90.5%) - Primary language for type-safe development
- **React** - Modern UI framework for building interactive interfaces
- **CSS/HTML** (1.5%/0.5%) - Styling and markup

### Backend  
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Backend type safety
- **Natural Language Processing Libraries** - For intent recognition and response generation

### Development Tools
- Git for version control
- Package managers (npm/yarn)
- Build tools and transpilers

## 🏗️ Project Architecture

```
ASTU-Chatbot/
├── frontend/                 # Client-side application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application views/pages
│   │   ├── services/       # API communication layer
│   │   ├── styles/         # CSS/SCSS stylesheets
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
│
├── backend/                 # Server-side application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Server utilities
│   └── config/             # Configuration files
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nboss21/ASTU-Chatbot.git
cd ASTU-Chatbot
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm run dev
```
Server will start at `http://localhost:5000`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm start
```
Application will open at `http://localhost:3000`

3. **Access the Chatbot**
Open your browser and navigate to `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration
Create a `.env` file in the backend directory with:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=your_database_url
API_KEY=your_api_key
```

### Frontend Configuration
Update API endpoints in `frontend/src/config/api.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:5000/api';
```

### Database Setup
(Instructions for setting up the knowledge base and database will be added as the project evolves)

## 🤝 Contributing

We welcome contributions from the ASTU community! Here's how you can help:

### Reporting Issues
- Check existing issues before creating new ones
- Provide detailed descriptions including steps to reproduce
- Include relevant screenshots or logs

### Feature Requests
- Explain the problem your feature would solve
- Suggest possible implementations
- Discuss potential impacts on existing functionality

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Include tests for new functionality
- Update documentation as needed

## 📄 License

This project is currently not licensed. For usage, contribution, or distribution inquiries, please contact the repository owner.

---

## 📞 Support & Contact

For questions, suggestions, or support:
- **Repository Owner**: [Nboss21](https://github.com/Nboss21)
- **Issue Tracker**: [GitHub Issues](https://github.com/Nboss21/ASTU-Chatbot/issues)

---

<div align="center">

**Built with ❤️ for the ASTU Community**

*Making university life smarter, one conversation at a time.*

</div>
