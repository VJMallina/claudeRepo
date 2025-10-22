# Development Setup Guide

## Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker** and Docker Compose
- **Git**
- Optional: **PostgreSQL** 14+ (if not using Docker)
- Optional: **Redis** 7+ (if not using Docker)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd claudeRepo

# Copy environment variables
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your favorite editor

# Install root dependencies
npm install

# Install all workspace dependencies
npm install
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis using Docker Compose
npm run docker:up

# Wait for services to be healthy (check with)
docker ps
```

### 3. Setup Database

```bash
# Generate Prisma client
cd services/api
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data
npm run seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Start API Server

```bash
# From root directory
npm run dev:api

# Or from services/api directory
cd services/api
npm run dev
```

The API will be available at:
- **API:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/api/v1/health

### 5. Start Mobile App (Coming Soon)

```bash
# From root directory
npm run dev:mobile

# Or from apps/mobile directory
cd apps/mobile
npm start
```

## Project Structure

```
claudeRepo/
├── apps/
│   └── mobile/              # React Native mobile app
├── services/
│   └── api/                 # NestJS backend API
│       ├── src/
│       │   ├── auth/        # Authentication module
│       │   ├── users/       # User management
│       │   ├── payments/    # UPI payments
│       │   ├── savings/     # Savings wallet
│       │   ├── investments/ # Investment management
│       │   ├── analytics/   # Analytics & insights
│       │   ├── notifications/ # Notification system
│       │   └── prisma/      # Database client
│       └── prisma/
│           └── schema.prisma # Database schema
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   └── ui-components/       # Shared UI components
├── infrastructure/
│   ├── docker/              # Docker configurations
│   └── kubernetes/          # K8s manifests
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── MVP_ROADMAP.md
│   ├── USER_FLOWS.md
│   ├── BDD_USER_STORIES.md
│   └── PRD.md
├── docker-compose.yml       # Local development services
├── package.json             # Monorepo configuration
└── .env.example             # Environment variables template
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=services/api

# Run tests in watch mode
npm run test:watch --workspace=services/api

# Run tests with coverage
npm run test:cov --workspace=services/api
```

### Database Migrations

```bash
cd services/api

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Linting and Formatting

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code with Prettier
npx prettier --write .
```

### Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up -d --build

# Remove volumes (deletes data!)
docker-compose down -v
```

## API Development

### Adding a New Endpoint

1. **Create DTO:**
```typescript
// src/module/dto/create-something.dto.ts
export class CreateSomethingDto {
  @IsString()
  name: string;
}
```

2. **Update Service:**
```typescript
// src/module/module.service.ts
async create(dto: CreateSomethingDto) {
  return this.prisma.something.create({
    data: dto,
  });
}
```

3. **Update Controller:**
```typescript
// src/module/module.controller.ts
@Post()
async create(@Body() dto: CreateSomethingDto) {
  return this.service.create(dto);
}
```

4. **Add Swagger Documentation:**
```typescript
@ApiOperation({ summary: 'Create something' })
@ApiResponse({ status: 201, description: 'Created' })
```

### Testing API Endpoints

#### Using cURL:
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Register user (example)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

#### Using Swagger UI:
1. Open http://localhost:3000/api/docs
2. Expand endpoint
3. Click "Try it out"
4. Fill parameters and execute

## Environment Variables

Key environment variables you need to configure:

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

### JWT
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_ACCESS_TOKEN_EXPIRY` - Access token expiry (e.g., "15m")
- `JWT_REFRESH_TOKEN_EXPIRY` - Refresh token expiry (e.g., "7d")

### SMS (Twilio)
- `TWILIO_ACCOUNT_SID` - Get from Twilio dashboard
- `TWILIO_AUTH_TOKEN` - Get from Twilio dashboard
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number

### Payment Gateway (Razorpay)
- `RAZORPAY_KEY_ID` - Get from Razorpay dashboard
- `RAZORPAY_KEY_SECRET` - Get from Razorpay dashboard
- `RAZORPAY_WEBHOOK_SECRET` - For webhook verification

### AWS (for file uploads)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` - e.g., "ap-south-1"
- `AWS_S3_BUCKET` - Your S3 bucket name

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
API_PORT=3001 npm run dev:api
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec -it saveinvest-postgres psql -U saveinvest -d saveinvest_db

# Restart database
docker-compose restart postgres
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset Prisma client cache
rm -rf node_modules/.prisma
npm install
```

### Module Not Found Errors

```bash
# Clear all node_modules
rm -rf node_modules services/*/node_modules packages/*/node_modules

# Reinstall everything
npm install
```

## Next Steps

1. ✅ Backend API structure created
2. ✅ Database schema defined
3. ✅ Docker setup complete
4. 🔄 Implement authentication module
5. ⏳ Create React Native mobile app
6. ⏳ Integrate payment gateway
7. ⏳ Build savings wallet feature
8. ⏳ Integrate investment platform

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Razorpay API Docs](https://razorpay.com/docs/api/)

## Getting Help

- Check our documentation in `/docs`
- Review user stories in `BDD_USER_STORIES.md`
- See architecture in `ARCHITECTURE.md`
- Ask questions in team Slack/Discord

---

**Happy Coding! 🚀**
