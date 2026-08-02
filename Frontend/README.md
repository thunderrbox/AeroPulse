# AeroPulse Frontend

The **AeroPulse** frontend is a modern React application engineered by **Abhijeet Singh Rana** using Vite, Tailwind CSS, and Redux Toolkit. It provides an intuitive interface for flight searches, digital boarding passes, authentication, profile management, and executive analytics.

## Responsibilities

The frontend is responsible for:

- Rendering the flight booking interface
- Managing authentication state
- Sending API requests to the backend
- Protecting authenticated routes
- Protecting admin-only routes
- Managing flights, bookings, and profile state
- Displaying loading, error, and success states
- Supporting dark and light themes

## Frontend Tech Stack

| Technology | Purpose |
|---|---|
| React | UI library |
| Vite | Development server and build tool |
| Tailwind CSS | Styling |
| Redux Toolkit | Global state management |
| React Router | Client-side routing |
| Axios | HTTP requests |
| Framer Motion | UI animations |
| React Query | Server-state support |

## Folder Structure

```text
Frontend/
│
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── layouts/          # Public and dashboard layouts
│   ├── routes/           # Route configuration
│   ├── services/         # API service functions
│   ├── store/            # Redux store and slices
│   ├── hooks/            # Custom React hooks
│   ├── context/          # Theme context
│   ├── utils/            # Utility functions
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
└── README.md
```

## Frontend Architecture

```mermaid
flowchart TD
    Pages[Pages] --> Components[Reusable Components]
    Pages --> Hooks[Custom Hooks]
    Hooks --> Redux[Redux Store]
    Hooks --> Services[API Services]
    Services --> Axios[Axios Client]
    Axios --> Backend[Express API]
```

## Redux and API Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as React Page
    participant R as Redux Slice
    participant S as API Service
    participant A as Axios Client
    participant B as Backend API

    U->>P: Performs an action
    P->>R: Dispatch async thunk
    R->>S: Call service function
    S->>A: Send HTTP request
    A->>B: Call API endpoint
    B-->>A: JSON response
    A-->>S: Response data
    S-->>R: Return result
    R-->>P: Update state
    P-->>U: Render updated UI
```

## Protected Route Flow

```mermaid
flowchart TD
    User[User visits protected page] --> CheckAuth{Authenticated?}
    CheckAuth -- No --> Login[Redirect to Login]
    CheckAuth -- Yes --> CheckRole{Admin route?}
    CheckRole -- No --> Page[Render Page]
    CheckRole -- Yes --> AdminCheck{User is Admin?}
    AdminCheck -- Yes --> AdminPage[Render Admin Page]
    AdminCheck -- No --> Unauthorized[Redirect / Show Unauthorized]
```

## Main Pages

### Public Pages
- Landing page
- Login page
- Register page
- Flight search page
- Flight results page
- Flight details page

### User Pages
- Booking flow
- Booking success page
- My bookings
- Profile page

