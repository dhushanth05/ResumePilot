# ResumeIQ – Intelligent Resume Analysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.111+-green)](https://fastapi.tiangolo.com/)

**ResumeIQ** is an AI-powered SaaS platform that analyzes resumes against job descriptions to provide comprehensive insights including ATS scoring, skill gap analysis, keyword matching, and actionable improvement suggestions.

## 🚀 Live Demo

[Live Demo Coming Soon] • [Product Tour] • [Video Walkthrough]

## ✨ Features

### Core Analysis
- **Resume Upload**: Support for PDF and DOCX formats
- **ATS Score Calculation**: Real-time applicant tracking system compatibility scoring
- **Skill Match Analysis**: Percentage-based skill matching against job requirements
- **Missing Skills Detection**: Identify gaps between resume and job description
- **Keyword Optimization**: Advanced keyword matching and density analysis

### Advanced Features
- **Resume Comparison**: Side-by-side comparison of multiple resumes
- **Analytics Dashboard**: Comprehensive overview and comparison analytics
- **Improvement Suggestions**: AI-powered recommendations for resume enhancement
- **Profile Management**: Secure user profiles with resume history
- **Admin Panel**: Complete user and resume management system

### Enterprise Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: User and admin privilege separation
- **Data Privacy**: End-to-end encryption for sensitive resume data
- **Scalable Architecture**: Built for enterprise-scale deployments

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Charts**: Recharts
- **State Management**: React Context API

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **AI/ML**: OpenAI API, Sentence Transformers, spaCy
- **File Processing**: PyPDF2, pdfplumber
- **Caching**: Redis

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Alembic
- **Environment Management**: Python-dotenv
- **API Documentation**: OpenAPI/Swagger (auto-generated)

## 🏗 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   FastAPI       │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         │              │    (Cache)      │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Storage  │    │   OpenAI API    │    │   Admin Panel   │
│   (Resumes)     │    │   (AI Analysis) │    │   (Management)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/resumeiq.git
cd resumeiq
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

#### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Admin Panel: http://localhost:3000/admin

## 🔧 Environment Variables

### Backend (.env)
```env
# Application
ENV=local
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DB=resumeiq

# Frontend
FRONTEND_ORIGIN=http://localhost:3000

# Admin API
ADMIN_API_KEY=your-admin-api-key-here

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Admin Panel
ADMIN_EMAIL=admin@resumeiq.com
ADMIN_PASSWORD=your-admin-password
ADMIN_SESSION_SECRET=your-session-secret-key
ADMIN_API_KEY=your-admin-api-key-here
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login-json` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Resume Analysis
- `POST /api/v1/resume/upload` - Upload and analyze resume
- `POST /api/v1/resume/analyze` - Analyze resume against job description
- `GET /api/v1/resume/{id}` - Get resume analysis results
- `GET /api/v1/resume/compare/{id1}/{id2}` - Compare two resumes

### User Management
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `GET /api/v1/user/resumes` - Get user's resume history

### Admin Endpoints
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/resumes` - List all resumes
- `GET /api/v1/admin/analytics` - Get platform analytics

## 📁 Project Structure

```
resumeiq/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages and layouts
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── types/               # TypeScript type definitions
│   └── services/            # API service layers
├── backend/                  # FastAPI backend application
│   ├── app/                 # Main application code
│   │   ├── ai/              # AI/ML processing modules
│   │   ├── core/            # Core application logic
│   │   ├── models/          # Database models
│   │   ├── routers/         # API route handlers
│   │   └── services/        # Business logic services
│   ├── alembic/             # Database migration files
│   ├── storage/             # File storage (resumes)
│   └── venv/                # Python virtual environment
├── docker/                   # Docker configuration files
└── README.md                # This file
```

## 🖥 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/1e293b/ffffff?text=ResumeIQ+Dashboard)
*Main analytics dashboard with resume insights and metrics*

### Resume Analysis
![Analysis](https://via.placeholder.com/800x400/1e293b/ffffff?text=Resume+Analysis+Results)
*Detailed ATS scoring and skill gap analysis*

### Comparison View
![Comparison](https://via.placeholder.com/800x400/1e293b/ffffff?text=Resume+Comparison)
*Side-by-side resume comparison feature*

## 🚀 Future Improvements

### Planned Features
- [ ] **Multi-language Support**: Resume analysis in multiple languages
- [ ] **Bulk Resume Processing**: Analyze multiple resumes simultaneously
- [ ] **Integration APIs**: Connect with popular ATS platforms
- [ ] **Mobile Applications**: Native iOS and Android apps
- [ ] **Advanced AI Models**: Custom fine-tuned models for specific industries
- [ ] **Real-time Collaboration**: Team features for recruiters

### Technical Enhancements
- [ ] **Microservices Architecture**: Split into specialized services
- [ ] **Advanced Analytics**: Machine learning for trend prediction
- [ ] **Performance Optimization**: Caching and database optimization
- [ ] **Security Enhancements**: Multi-factor authentication, audit logs
- [ ] **Compliance**: GDPR, CCPA, and other privacy regulations

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint and Prettier for TypeScript/JavaScript
- Write comprehensive tests for new features
- Update documentation for API changes

### Reporting Issues
- Use GitHub Issues for bug reports and feature requests
- Provide detailed descriptions and reproduction steps
- Include relevant logs and screenshots

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Project Maintainer**: [Your Name](mailto:your.email@resumeiq.com)
- **Website**: [https://resumeiq.com](https://resumeiq.com)
- **Documentation**: [https://docs.resumeiq.com](https://docs.resumeiq.com)
- **Support**: [support@resumeiq.com](mailto:support@resumeiq.com)

---

**ResumePilot** - Transform your career with AI-powered resume intelligence.
