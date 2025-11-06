# Application Architecture

## Overview
A mobile-first fintech application that enables users to automatically save a percentage of their UPI transactions and invest those savings.

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile Application                        │
│                    (React Native / Flutter)                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTPS/WSS
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                         API Gateway                              │
│                    (Kong / AWS API Gateway)                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
┌───────────────▼────────┐         ┌───────────▼──────────┐
│   Authentication &     │         │  Application Layer   │
│  Authorization Service │         │   (Microservices)    │
│   (OAuth 2.0 / JWT)   │         │                      │
└────────────────────────┘         └──────────┬───────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────┐
                    │                         │                     │
        ┌───────────▼──────────┐  ┌──────────▼────────┐  ┌────────▼─────────┐
        │   Payment Service    │  │  Savings Service  │  │ Investment Service│
        │  (UPI Integration)   │  │ (Auto-deduction)  │  │ (Fund Management) │
        └───────────┬──────────┘  └──────────┬────────┘  └────────┬─────────┘
                    │                        │                     │
                    └────────────────────────┼─────────────────────┘
                                             │
                    ┌────────────────────────┼─────────────────────┐
                    │                        │                     │
        ┌───────────▼──────────┐  ┌──────────▼────────┐  ┌────────▼─────────┐
        │   PostgreSQL         │  │      Redis        │  │    MongoDB       │
        │ (Transactional Data) │  │  (Cache/Session)  │  │ (Flexible Schema)│
        └──────────────────────┘  └───────────────────┘  └──────────────────┘
```

### External Integrations
```
┌─────────────────────────────────────────────────────────────────┐
│                     Payment Gateway / UPI                        │
│         (Razorpay / PayU / Cashfree / PhonePe / NPCI)          │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                   Investment Platforms API                       │
│              (Mutual Funds / Digital Gold / Bonds)              │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                      KYC Service Provider                        │
│                    (DigiLocker / Aadhaar eKYC)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack Recommendations

### Mobile Application
**Option 1: React Native (Recommended for faster development)**
- **Language**: JavaScript/TypeScript
- **State Management**: Redux Toolkit / Zustand / Recoil
- **Navigation**: React Navigation
- **UI Library**: React Native Paper / NativeBase / Tamagui
- **UPI Integration**: Custom Native Modules (Android: UPI SDK, iOS: Fallback)
- **Security**:
  - react-native-keychain (secure storage)
  - react-native-biometrics (fingerprint/face auth)
  - SSL Pinning

**Option 2: Flutter**
- **Language**: Dart
- **State Management**: Riverpod / Bloc
- **UI**: Material Design / Custom widgets
- **UPI Integration**: Platform channels with native UPI SDK
- **Security**: flutter_secure_storage, local_auth

### Backend Services
**Recommended Stack: Node.js Microservices**
- **Framework**: NestJS (TypeScript) or Express.js
- **API Protocol**: RESTful API + GraphQL (for complex queries)
- **Authentication**: Passport.js with JWT
- **Validation**: class-validator, Joi
- **Documentation**: Swagger/OpenAPI

**Alternative: Go**
- High performance, excellent for payment processing
- Frameworks: Gin, Echo, Fiber
- Better concurrency for real-time operations

**Alternative: Python (FastAPI)**
- Great for ML integration (future investment recommendations)
- FastAPI for async operations

### Databases

**Primary Database: PostgreSQL**
- User accounts
- Transaction records
- Savings wallet data
- Investment portfolios
- Audit logs
- **Why**: ACID compliance, strong consistency for financial data

**Cache Layer: Redis**
- Session management
- Rate limiting
- Real-time transaction status
- OTP storage
- **Why**: Fast, reliable, supports pub/sub

**Document Store: MongoDB (Optional)**
- Investment product catalogs
- User preferences
- Analytics data
- Notifications
- **Why**: Flexible schema for evolving features

### Infrastructure & DevOps

**Cloud Provider** (Choose one):
1. **AWS** (Most comprehensive)
   - EC2/ECS/EKS for compute
   - RDS for PostgreSQL
   - ElastiCache for Redis
   - S3 for document storage
   - CloudWatch for monitoring
   - WAF for security

2. **Google Cloud Platform**
   - GKE for Kubernetes
   - Cloud SQL
   - Cloud Memorystore

3. **Azure**
   - AKS
   - Azure Database for PostgreSQL
   - Azure Cache for Redis

**Containerization & Orchestration**
- **Docker**: Container runtime
- **Kubernetes**: Orchestration (for production scale)
- **Docker Compose**: Local development

**CI/CD**
- GitHub Actions / GitLab CI / Jenkins
- Automated testing
- Blue-green deployments

**Monitoring & Logging**
- **Application Monitoring**: New Relic / DataDog / AppDynamics
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) / Loki
- **Error Tracking**: Sentry
- **APM**: Prometheus + Grafana

### Payment Gateway Integration

**Recommended Options in India:**

1. **Razorpay** (Recommended for MVP)
   - Easy integration
   - UPI, Cards, Netbanking, Wallets
   - Good documentation
   - Webhooks for payment status
   - Settlement reports
   - Pricing: ~2% per transaction

2. **Cashfree**
   - Similar features to Razorpay
   - Competitive pricing

3. **PhonePe PG / PayU**
   - Alternatives with good market presence

4. **Direct NPCI Integration** (For later stages)
   - Lower costs
   - More control
   - Requires PSP license and compliance

### Security Architecture

**Authentication & Authorization**
- **OAuth 2.0** with JWT tokens
- **Access tokens**: Short-lived (15 min)
- **Refresh tokens**: Long-lived (7-30 days)
- **MFA**: OTP via SMS/Email
- **Biometric**: Fingerprint/Face ID for app unlock

**Data Security**
- **Encryption at rest**: AES-256
- **Encryption in transit**: TLS 1.3
- **SSL Pinning**: Prevent MITM attacks
- **Data masking**: PII protection in logs
- **Key Management**: AWS KMS / HashiCorp Vault

**Compliance**
- **PCI DSS**: For payment card data
- **RBI Guidelines**: For payment aggregators
- **GDPR/DPDPA**: For user data protection
- **KYC/AML**: Know Your Customer compliance

**API Security**
- Rate limiting (Redis-based)
- API key rotation
- Request signing
- IP whitelisting for admin APIs

### Scalability Considerations

**Horizontal Scaling**
- Stateless services for easy scaling
- Load balancer (NGINX / AWS ALB)
- Auto-scaling groups

**Database Scaling**
- Read replicas for PostgreSQL
- Sharding strategy for future growth
- Connection pooling (PgBouncer)

**Caching Strategy**
- CDN for static assets (CloudFront / Cloudflare)
- Application-level caching
- Database query caching

**Async Processing**
- Message Queue: RabbitMQ / Apache Kafka / AWS SQS
- Background jobs: Bull (Node.js) / Celery (Python)
- Use cases:
  - Automatic savings calculation
  - Investment processing
  - Email/SMS notifications
  - Report generation

### Development Practices

**Monorepo Structure** (Recommended)
```
claudeRepo/
├── apps/
│   ├── mobile/              # React Native app
│   ├── admin-dashboard/     # Admin web portal
│   └── landing-page/        # Marketing website
├── services/
│   ├── auth-service/
│   ├── payment-service/
│   ├── savings-service/
│   ├── investment-service/
│   └── notification-service/
├── packages/
│   ├── shared-types/        # TypeScript types
│   ├── ui-components/       # Shared UI
│   └── utils/               # Common utilities
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/           # IaC
└── docs/
```

**Tools**
- **Monorepo Management**: Turborepo / Nx / Lerna
- **Version Control**: Git + GitHub
- **Code Quality**: ESLint, Prettier, Husky
- **Testing**: Jest, React Testing Library, Supertest
- **E2E Testing**: Detox (mobile), Playwright (web)

## API Architecture

### RESTful API Design
```
Base URL: https://api.yoursavingsapp.com/v1

Authentication:
POST   /auth/register
POST   /auth/login
POST   /auth/verify-otp
POST   /auth/refresh-token
POST   /auth/logout

User Management:
GET    /users/profile
PUT    /users/profile
POST   /users/kyc
GET    /users/kyc-status

Payment/UPI:
POST   /payments/initiate
POST   /payments/verify
GET    /payments/history
GET    /payments/:id

Savings:
GET    /savings/wallet
GET    /savings/config          # Get saving percentage
PUT    /savings/config          # Update saving percentage
GET    /savings/history
GET    /savings/analytics

Investments:
GET    /investments/products    # Available investment options
POST   /investments/purchase
GET    /investments/portfolio
GET    /investments/history
GET    /investments/:id

Notifications:
GET    /notifications
PUT    /notifications/:id/read
```

### WebSocket Endpoints (Optional - for real-time updates)
```
wss://ws.yoursavingsapp.com/v1/live
- Payment status updates
- Investment value changes
- Notifications
```

## Data Flow

### UPI Transaction with Auto-Save Flow
```
1. User initiates UPI payment (₹1000)
   ↓
2. Mobile app → Payment Service API
   ↓
3. Payment Service → Payment Gateway
   ↓
4. Payment Gateway → UPI Network → Merchant
   ↓
5. Payment Success Webhook → Payment Service
   ↓
6. Payment Service emits event → Message Queue
   ↓
7. Savings Service consumes event
   ↓
8. Calculate savings (e.g., 10% = ₹100)
   ↓
9. Credit to Savings Wallet (Database)
   ↓
10. Notification Service → Push notification to user
    ↓
11. Mobile app updates balance in real-time
```

## Disaster Recovery & Backup

- **Database Backups**: Daily automated backups with point-in-time recovery
- **Multi-region deployment**: For high availability
- **Disaster Recovery Plan**: RPO < 1 hour, RTO < 4 hours
- **Transaction logs**: Immutable audit trail

## Cost Estimation (MVP - Monthly)

**Infrastructure** (AWS):
- EC2/ECS instances: $200-500
- RDS PostgreSQL: $100-200
- ElastiCache Redis: $50-100
- S3 + CloudFront: $50
- Load Balancer: $20
- Total: ~$500-1000/month

**Payment Gateway**:
- Variable based on transaction volume
- ~2% per transaction

**Third-party Services**:
- SMS/Email: $50-100
- Monitoring: $50-100
- KYC services: Pay per verification

**Total MVP Cost**: ~$700-1300/month (excluding transaction fees)

## Future Scalability Features

As your application grows, consider:
- Microservices decomposition
- Event-driven architecture (CQRS)
- GraphQL Federation
- Serverless functions for specific tasks
- Machine Learning for investment recommendations
- Blockchain integration for transparency
- Multi-currency support
- International payments
