# CareShield - Health Insurance & Claims Portal

A full-stack insurance claims management system with Spring Boot backend and React frontend.

## Tech Stack

### Backend
- **Spring Boot 3.3.2** with Java 17
- **Spring Data JPA** + Hibernate
- **H2 In-Memory Database** (dev)
- **Maven** for build

### Frontend
- **React 18** with Vite
- **Tailwind CSS v4** for styling
- **React Router v6** for routing
- **TanStack Query (React Query)** for server state
- **React Hook Form + Zod** for forms/validation
- **Recharts** for admin analytics
- **Lucide React** for icons

## Features

### User Portal
- **Authentication**: Email or mobile login, registration with role selection
- **Dashboard**: Policy overview with progress bars, recent claims, stat cards
- **Submit Claim**: 3-step wizard (Policy → Hospital Details → Documents)
- **Track Claims**: Searchable, filterable claims table with status badges
- **Explore Policies**: Catalog with one-click enrollment
- **Profile Settings**: Name, mobile, address, 2FA toggle, password change
- **Notifications**: Bell icon with unread count, dropdown, toast alerts

### Admin Portal
- **Dashboard**: Claims queue stats, pending claims action table
- **User Management**: View all users with roles and 2FA status
- **Policy Management**: All policies with coverage/remaining balances
- **Claims Management**: Review/approve/reject/settle claims with remarks
- **Reports**: Monthly claims volume (bar chart), claims by provider (pie chart)

### Key Design Decisions
- **Light healthcare SaaS theme** (slate/primary/teal palette)
- **INR currency** formatting (₹5,00,000)
- **CLM-YYYY-NNN** claim number format
- **4-stage claim tracker**: Submitted → Under Review → Approved → Settled
- **Multi-document upload** with type labels (Hospital Bill, Discharge Summary, Medical Docs, Payment Receipt)
- **Responsive layout** with collapsible sidebar

## Getting Started

### Prerequisites
- Java 17+ (Microsoft OpenJDK 17 recommended)
- Maven 3.9+
- Node.js 18+ (for frontend development)

### Quick Start (Single JAR)

```bash
# Build frontend (outputs to backend static resources)
cd frontend
npm install
npm run build

# Run Spring Boot (serves React on /)
cd ..
mvn spring-boot:run
```

App runs at **http://localhost:8080**

### Development Mode

```bash
# Terminal 1: Backend
cd care-shield-main
mvn spring-boot:run

# Terminal 2: Frontend (with HMR)
cd frontend
npm install
npm run dev
```

Frontend dev server at **http://localhost:3000** (proxies `/api` to backend)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| User | santhosh@email.com | password |
| Admin | admin@example.com | password |

## Project Structure

```
care-shield-main/
├── backend/ (Spring Boot)
│   ├── src/main/java/com/insurance/portal/
│   │   ├── model/          # User, Policy, Claim, ClaimDocument, Notification
│   │   ├── repository/     # Spring Data JPA repositories
│   │   ├── controller/     # REST endpoints (PortalController)
│   │   └── InsurancePortalApplication.java  # Seeds demo data
│   └── src/main/resources/
│       ├── application.properties
│       └── static/         # React build output (copied by Vite)
└── frontend/ (React + Vite)
    ├── src/
    │   ├── api/            # Axios instance + endpoints
    │   ├── components/     # UI components (layout, ui, forms, dashboard, claims, admin)
    │   ├── contexts/       # AuthContext, NotificationContext
    │   ├── hooks/          # useAuth, useNotifications, useApi (React Query)
    │   ├── pages/          # Route-level pages
    │   ├── utils/          # currency, date, claimNumber, cn
    │   ├── App.jsx         # Routes + ProtectedRoute
    │   └── main.jsx        # Entry (QueryClient, BrowserRouter, Providers)
    ├── index.html
    ├── vite.config.js      # Outputs to ../backend/src/main/resources/static
    └── tailwind.config.js  # Custom theme
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (email OR mobile) |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/policies?userId={id}` | User's policies |
| POST | `/api/policies/purchase` | Enroll in policy |
| GET | `/api/claims?userId={id}` | User's claims |
| POST | `/api/claims` | Submit claim (multipart) |
| GET | `/api/claims/track/{claimNumber}` | Track by claim number |
| GET | `/api/claims/{id}/documents` | Claim document metadata |
| PUT | `/api/claims/{id}/status` | Update claim status (admin) |
| GET | `/api/notifications?userId={id}` | User notifications |
| PUT | `/api/notifications/{id}/read` | Mark notification read |
| GET | `/api/admin/stats` | Admin dashboard stats |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/policies` | All policies |
| GET | `/api/admin/claims` | All claims |
| GET | `/api/admin/reports` | Analytics data |

## Database Schema

- **users**: id, email, password, full_name, role, mobile, address, two_factor_enabled
- **policies**: id, policy_number, policy_name, policy_type, coverage_limit, remaining_balance, deductible, premium_amount, status, start_date, end_date, user_id
- **claims**: id, claim_number, policy_number, claim_type, provider, hospital_address, admission_date, discharge_date, service_date, claim_amount, description, status, remarks, submission_date, user_id
- **claim_documents**: id, claim_id, document_type, file_name, file_type, document_base64
- **notifications**: id, user_id, message, type, is_read, created_at

## License

MIT