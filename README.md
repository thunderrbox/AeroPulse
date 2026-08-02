# AeroPulse — Next-Gen Flight Booking Platform

> Engineered & Authored Exclusively by **Abhijeet Singh Rana** (`thunderrbox`)

**AeroPulse** is a full-stack flight booking and aviation management platform engineered by **Abhijeet Singh Rana**. Built using the MERN stack, it enables users to search routes in real-time, create instant reservations, and inspect digital boarding passes, while administrators access real-time revenue analytics and flight management tools.

## Project Overview

AeroPulse is split into two independent applications:

- **Frontend** — React client for users and administrators
- **Backend** — Node.js REST API responsible for authentication, flights, bookings, validation, and database operations

For detailed setup and architecture of each application:

- [Backend Documentation](./Backend/README.md)
- [Frontend Documentation](./Frontend/README.md)

## Key Features

### User Features

- Register and log in securely
- Search flights by origin, destination, date, passengers, and cabin class
- View flight details and availability
- Create bookings
- View booking history
- Cancel eligible bookings
- Update profile details
- Dark/light theme support

### Admin Features

- Dashboard analytics
- Add, edit, and manage flights
- Manage user bookings
- View booking and revenue statistics
- Role-based protected routes

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Redux Toolkit, React Router, Axios |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Authentication | JWT access tokens, refresh tokens, bcrypt |
| Deployment | Vercel, Render, MongoDB Atlas |

## System Architecture

```mermaid
flowchart LR
    User[User / Admin] --> Frontend[React Frontend]
    Frontend --> API[Express REST API]
    API --> DB[(MongoDB Atlas)]

    API --> Auth[JWT Authentication]
    API --> Flights[Flight Module]
    API --> Booking[Booking Module]
    API --> Admin[Admin Module]
```

## End-to-End Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as React Frontend
    participant A as Express API
    participant D as MongoDB

    U->>F: Search or booking action
    F->>A: API request using Axios
    A->>A: Validate request and authenticate user
    A->>D: Read or update data
    D-->>A: Database response
    A-->>F: JSON response
    F-->>U: Updated UI
```

## Deployment Architecture

```mermaid
flowchart TB
    User --> Vercel[Vercel - React Frontend]
    Vercel --> Render[Render - Node.js API]
    Render --> Atlas[(MongoDB Atlas)]
```

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd SkyWay
```

### 2. Start the backend

```bash
cd Backend
npm install
npm run dev
```

### 3. Start the frontend

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend will run locally and communicate with the backend API using the configured environment variable.

## Repository Structure

```bash
SkyWay/
│
├── Backend/          # Node.js + Express REST API
├── Frontend/         # React + Vite client application
├── README.md         # Project-level documentation
└── .gitignore
```

## Documentation Map

| Documentation | Contains |
|---|---|
| Root README | Overall project architecture, setup order, deployment overview |
| Backend README | API, database models, authentication, booking transaction flow |
| Frontend README | React architecture, Redux state management, route protection, UI setup |

## Author

**Abhijeet Singh Rana**