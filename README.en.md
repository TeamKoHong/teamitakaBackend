# 🚀 TeamItaka Backend

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

TeamItaka Backend API - A comprehensive RESTful API for team project recruitment and collaboration platform.

> **English** | [한국어](README.md)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database](#-database)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

## ✨ Features

- **User Authentication & Authorization**
  - Email verification with 6-digit code
  - JWT-based authentication
  - Google OAuth integration
  - Secure password hashing with bcrypt

- **Project Management**
  - Create, read, update, delete projects
  - Project recruitment system
  - Application tracking
  - Team member management

- **User Profiles**
  - Customizable user profiles
  - Skills and experience tracking
  - Portfolio management

- **Social Features**
  - Comments and replies
  - Project reviews and ratings
  - Bookmark/scrap functionality
  - Vote system

- **Search & Discovery**
  - Advanced project search
  - Filtering by skills, roles, status
  - User search

- **Admin Features**
  - User management
  - Content moderation
  - System monitoring

## 🛠 Tech Stack

### Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL / PostgreSQL (Supabase)
- **ORM**: Sequelize

### Authentication & Security
- **JWT**: jsonwebtoken, jose
- **Password Hashing**: bcrypt, bcryptjs
- **Validation**: Joi, express-validator
- **Rate Limiting**: express-rate-limit
- **CORS**: cors

### Email & Communication
- **Email Service**: SendGrid, Nodemailer
- **Template Engine**: markdown-it, marked

### Development & Testing
- **Testing**: Jest, Supertest
- **Linting**: ESLint, Prettier
- **Process Manager**: nodemon
- **Environment**: dotenv, cross-env

### Cloud & Deployment
- **Database**: Supabase PostgreSQL
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Storage**: Supabase Storage

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MySQL 8.0+ or PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/TeamKoHong/teamitakaBackend.git
cd teamitakaBackend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy example environment file
cp .env.example .env.development

# Edit .env.development with your configuration
nano .env.development
```

4. **Initialize database**
```bash
# Run migrations
npm run migrate:dev

# Seed initial data (optional)
npm run seed:dev
```

5. **Start development server**
```bash
npm run dev
```

The server will start at `http://0.0.0.0:8080`

### Quick Start with Docker

```bash
# Using Docker Compose
docker-compose up -d
```

## 📁 Project Structure

```
teamitakaBackend/
├── src/
│   ├── config/          # Configuration files (DB, env)
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares (auth, validation)
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions
│   ├── validations/     # Request validation schemas
│   ├── templates/       # Email templates
│   └── app.js           # Express app configuration
├── tests/               # Test files
├── scripts/             # Utility scripts
├── migrations/          # Database migrations
├── docs/                # Documentation
├── index.js             # Application entry point
└── package.json         # Dependencies and scripts
```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8080`
- **Production**: `https://huwajjafqbfrcxkdfker.supabase.co/functions/v1/teamitaka-api`

### Main Endpoints

#### Authentication
```
POST   /api/auth/register              # Register new user
POST   /api/auth/login                 # Login
POST   /api/auth/logout                # Logout
POST   /api/auth/send-verification     # Send email verification code
POST   /api/auth/verify-code           # Verify email code
GET    /api/auth/google                # Google OAuth login
```

#### Users
```
GET    /api/users/:id                  # Get user profile
PUT    /api/users/:id                  # Update user profile
DELETE /api/users/:id                  # Delete user account
```

#### Projects
```
GET    /api/projects                   # List all projects
GET    /api/projects/:id               # Get project details
POST   /api/projects                   # Create new project
PUT    /api/projects/:id               # Update project
DELETE /api/projects/:id               # Delete project
```

#### Applications
```
GET    /api/applications               # List applications
POST   /api/applications               # Apply to project
PUT    /api/applications/:id           # Update application status
```

#### Comments
```
GET    /api/comments/:projectId        # Get project comments
POST   /api/comments                   # Create comment
PUT    /api/comments/:id               # Update comment
DELETE /api/comments/:id               # Delete comment
```

#### Search
```
GET    /api/search/projects            # Search projects
GET    /api/search/users               # Search users
```

#### Admin
```
GET    /api/admin/users                # List all users
PUT    /api/admin/users/:id/role       # Update user role
DELETE /api/admin/users/:id            # Delete user (admin)
```

#### Health Check
```
GET    /api/health                     # Server health status
```

For detailed API documentation, see [API_DOCS.md](docs/API_DOCS.md)

## 🗄 Database

### Supported Databases
- **MySQL 8.0+** (Local development)
- **PostgreSQL 14+** (Supabase production)

### Database Models

- **Users**: User accounts and profiles
- **Projects**: Project information
- **Recruitments**: Project recruitment posts
- **Applications**: Project applications
- **Comments**: Comments on projects
- **Reviews**: Project reviews
- **Scraps**: Bookmarked projects
- **Votes**: Vote system
- **EmailVerifications**: Email verification codes

### Migrations

```bash
# Run migrations
npm run migrate:dev          # Development
npm run migrate:prod         # Production

# Rollback migrations
npm run rollback:dev         # Rollback last migration
npm run undo-migrate:dev     # Rollback all migrations

# Seed data
npm run seed:dev             # Seed development data
```

### Database Initialization

```bash
# Initialize database with all tables
npm run db:init:dev

# Simple initialization
npm run db:init:simple:dev

# Reset database
npm run db:reset
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev                  # Start with nodemon (hot reload)
npm run dev:supabase        # Start with Supabase config

# Production
npm start                    # Start production server
npm run start:supabase      # Start with Supabase config

# Testing
npm test                     # Run all tests
npm run test:watch          # Run tests in watch mode

# Code Quality
npm run lint                 # Run ESLint and Prettier

# Database
npm run migrate:dev         # Run migrations
npm run seed:dev            # Seed database
npm run db:init:dev         # Initialize database

# Verification
npm run verify              # Verify deployment
npm run verify:supabase     # Verify Supabase deployment
```

### Development Workflow

1. **Create a new branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
```bash
# Edit files
# Write tests
```

3. **Run tests**
```bash
npm test
```

4. **Commit changes**
```bash
git add .
git commit -m "feat: your feature description"
```

5. **Push to remote**
```bash
git push origin feature/your-feature-name
```

6. **Create Pull Request**

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/auth.test.js

# Watch mode
npm test -- --watch
```

### Test Structure

```javascript
describe('Auth Controller', () => {
  it('should register a new user', async () => {
    // Test implementation
  });

  it('should login with valid credentials', async () => {
    // Test implementation
  });
});
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory.

## 🚀 Deployment

### Supabase Edge Functions

This project can be deployed to Supabase Edge Functions:

1. **Install Supabase CLI**
```bash
npm install -g supabase
```

2. **Login to Supabase**
```bash
supabase login
```

3. **Deploy Edge Function**
```bash
# Deploy to Supabase
supabase functions deploy teamitaka-api
```

For detailed deployment instructions, see:
- [Supabase Deployment Guide](docs/deployment/SUPABASE_EDGE_FUNCTION_DEPLOYMENT_GUIDE.md)
- [Local Development Setup](docs/deployment/LOCAL_DEV_SETUP_GUIDE.md)

### Environment-Specific Deployment

```bash
# Development
npm run dev

# Supabase (Production)
npm run start:supabase
```

## 🔐 Environment Variables

### Required Variables

```bash
# Node Environment
NODE_ENV=development                    # development, production, test

# Server Configuration
PORT=8080                              # Server port
HOST=0.0.0.0                          # Server host (0.0.0.0 for all interfaces)

# Database (MySQL)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=teamitaka
DB_PORT=3306
DB_DIALECT=mysql

# Database (PostgreSQL/Supabase)
DB_DIALECT=postgres
DB_HOST=db.xxx.supabase.co
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Service (SendGrid)
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@teamitaka.com
SENDGRID_API_KEY=your_sendgrid_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# CORS
CORS_ORIGIN=http://localhost:3000     # Frontend URL
CORS_CREDENTIALS=true

# Supabase (Optional)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

### Environment Files

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Testing environment
- `env.supabase` - Supabase configuration

**Note**: Never commit `.env` files to version control!

## 📖 Documentation

Additional documentation can be found in the `docs/` directory:

- [API Documentation](docs/API_DOCS.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
- [Local Development Setup](docs/deployment/LOCAL_DEV_SETUP_GUIDE.md)
- [Supabase Migration Guide](docs/deployment/SUPABASE_COMPLETE_MIGRATION_GUIDE.md)
- [Email Verification Implementation](docs/EmailVerification/IMPLEMENTATION_GUIDE.md)
- [Google OAuth Implementation](docs/GoogleSocialLogin/IMPLEMENTATION_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📝 License

This project is licensed under the ISC License.

## 👥 Team

**TeamItaka Development Team**

- Backend Development
- API Design
- Database Architecture
- DevOps & Deployment

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/TeamKoHong/teamitakaBackend/issues) for bug reports and feature requests.

## 📮 Contact

For questions or support, please contact the development team.

---

**Last Updated**: 2025-01-17
**Version**: 1.0.0
**Maintained by**: TeamItaka Development Team
