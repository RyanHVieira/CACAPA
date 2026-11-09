# Auth System - C# Backend + React Frontend

A complete authentication system with:
- **Backend**: ASP.NET Core 8.0 with PostgreSQL (Supabase)
- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: JWT-based with nick and password

## Features

- User registration with nick and password
- User login with JWT token generation
- Protected routes
- Password hashing with BCrypt
- PostgreSQL database with Entity Framework Core
- Supabase compatible

## Project Structure

```
.
├── backend/                 # ASP.NET Core API
│   ├── src/AuthApi/        # Main API project
│   │   ├── Controllers/    # API controllers
│   │   ├── Data/           # DbContext and migrations
│   │   ├── Models/         # Entity models
│   │   ├── Services/       # Business logic
│   │   └── DTOs/           # Data transfer objects
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── hooks/          # Custom hooks
```

## Prerequisites

- .NET 8.0 SDK
- Node.js 20+
- Supabase account (or local PostgreSQL)

## Setup

### 1. Configure Backend

Edit `backend/src/AuthApi/appsettings.json` with your Supabase connection:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-with-at-least-32-characters-for-hmac-sha256",
    "Issuer": "AuthApi",
    "Audience": "AuthApiUsers",
    "ExpirationMinutes": 60
  }
}
```

Get your Supabase connection string from: Project Settings → Database → Connection pooling

### 2. Run Backend

```bash
cd backend
dotnet restore
dotnet run --project src/AuthApi
```

API runs on `http://localhost:8080`

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (proxies API calls to `http://localhost:8080`)

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Test with Bruno/Postman

**Register**
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "nick": "myuser",
  "password": "password123"
}
```

**Login**
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "nick": "myuser",
  "password": "password123"
}
```

**Get Current User**
```bash
GET http://localhost:8080/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Schema

Auto-created on first run via EF Core migrations:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nick VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_nick ON users(nick);
```

## Environment Variables

### Backend (`appsettings.json` or environment)

| Variable | Description | Required |
|----------|-------------|----------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL/Supabase connection string | Yes |
| `JwtSettings__SecretKey` | JWT signing key (min 32 chars) | Yes |
| `JwtSettings__Issuer` | JWT issuer | No (default: AuthApi) |
| `JwtSettings__Audience` | JWT audience | No (default: AuthApiUsers) |
| `JwtSettings__ExpirationMinutes` | Token expiration in minutes | No (default: 60) |

### Frontend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | /api (proxied by Vite) |

## Security Notes

- Passwords hashed with BCrypt (default work factor)
- JWT tokens use HS256 algorithm
- Tokens expire in 60 minutes (configurable)
- CORS configured for `localhost:5173` and `localhost:3000`
- All auth endpoints validate input

## Production Deployment

1. Set `ASPNETCORE_ENVIRONMENT=Production`
2. Use strong JWT secret key (64+ chars)
3. Use HTTPS
4. Configure proper CORS origins
5. Use connection pooling for Supabase/PostgreSQL

## License

MIT