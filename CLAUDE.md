# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based REST API for an **alumni club management system** for FTIP Unpad (Fakultas Teknologi Informasi dan Pendidikan). The system manages alumni profiles, job postings, and business listings for FTIP alumni.

## Technology Stack

- **Runtime**: Bun (fast all-in-one JavaScript runtime)
- **Framework**: Express.js v5.1.0
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma v5.17.0
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod schemas
- **Language**: TypeScript (ESNext target)

## Development Commands

```bash
# Install dependencies
bun install

# Development server with hot reload
bun run dev
# Alternative: tsx watch src/index.ts

# Build for production
bun run build

# Start production server
bun run start

# Database operations
npx prisma migrate dev    # Create and apply migrations
npx prisma generate       # Generate Prisma client
npx prisma studio        # Open database browser
```

## Database Architecture

### Core Models
- **User**: Authentication base with role-based access (USER/ADMIN)
- **AlumniProfile**: Extended alumni data with department, class year, employment info
- **JobPosting**: Job opportunities for alumni
- **BusinessPosting**: Business directory and shopping features

### Database Configuration
- Uses both `DATABASE_URL` (connection pooling) and `DIRECT_URL` (migrations)
- Supabase hosting with automatic backups
- Prisma migrations in `prisma/migrations/`

### Key Enums
- **Department**: TEP, TPN, TIN (FTIP departments)
- **EmploymentLevel**: INTERN, ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, MANAGER, DIRECTOR, C_LEVEL
- **IndustryField**: AGRICULTURE, CREATIVE, EDUCATION, ENGINEERING, FINANCE, HEALTHCARE, HOSPITALITY, INFORMATION_TECHNOLOGY, LEGAL, MANUFACTURING, MARKETING, MEDIA, PUBLIC_SERVICE, REAL_ESTATE, RETAIL, SCIENCE, SPORTS, TRANSPORTATION, UTILITIES, OTHER

## API Structure

### Authentication Pattern
- JWT-based authentication with 7-day expiry
- Bearer token in Authorization header
- Protected routes use `auth.middleware.ts`
- Role-based access control

### Current Endpoints
- `GET /api` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Project Structure
```
src/
├── controllers/     # Request handlers
├── services/       # Business logic
├── middlewares/    # Express middleware
├── routers/        # API routes
└── types/         # TypeScript definitions and Zod schemas
```

## Architecture Patterns

### Service-Controller Pattern
- Controllers handle HTTP requests/responses
- Services contain business logic
- Clear separation of concerns

### Validation
- All API inputs validated with Zod schemas
- Type-safe request/response handling
- Indonesian error messages in validation

### Environment Variables
Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection
- `BASE_URL_FE` - Frontend URL for CORS
- `JWT_SECRET` - JWT signing key
- `APP_NAME` - Application name

## Development Notes

- Error messages are in Indonesian (e.g., "Email sudah terdaftar")
- Follow FTIP-specific business logic and field naming
- Use Prisma client from `src/prisma.ts` for database operations
- CORS configured for frontend integration
- Cookie-based session management available but not primary auth method