## Interview Portal

An end-to-end **interview scheduling portal** built with a React frontend and a TypeScript/Express backend, backed by MongoDB.  
It lets you create, edit, and manage interviews, check participant availability, and use an **AI-powered description generator** for company and role descriptions.

---

## Features

- **Interview scheduling**
  - Create interviews with title, role, company name, role description, company description
  - Select multiple participants (by email)
  - Validate required fields and time ranges
- **Availability checking**
  - Check which users are available in a given time window before scheduling
- **Edit & manage**
  - View upcoming interviews
  - Edit interview details and participants
  - Delete interviews
- **AI-powered descriptions**
  - Generate **role description** and **company description** via OpenAI
  - Works from the **Schedule Interview** and **Edit Interview** pages

---

## Tech Stack

- **Frontend**
  - React (Create React App)
  - React Router
  - React Bootstrap / Bootstrap
  - React Select
  - Moment.js

- **Backend**
  - Node.js, Express
  - TypeScript
  - MongoDB with Mongoose
  - OpenAI API (chat completions)

---

## Project Structure

```text
InterviewPortal/
  client/       # React SPA (interview scheduler UI)
  server/       # Express + TypeScript API
```

- `client/src/pages/ScheduleInterview.js` – create/schedule interview page  
- `client/src/pages/EditPage.js` – edit existing interview  
- `client/src/pages/UpcomingInterview.js` – list of upcoming interviews (not shown above but used by navigation)  
- `server/index.ts` – Express app entry point  
- `server/routers/interview.ts` – interview-related API routes  
- `server/routers/user.ts` – user email list API  
- `server/usecases/interview.ts` – core interview business logic  
- `server/utils/aiService.ts` – OpenAI description generation helpers  
- `server/models/*.ts` – Mongoose models  
- `server/config/db.connect.ts` – MongoDB connection

---

## Prerequisites

- Node.js (LTS) installed
- MongoDB running locally or accessible via connection string
- An **OpenAI API key** (for description generation)

---

## Environment Configuration

### Server (`server/.env`)

Create a `.env` file inside the `server` folder with at least:

```env
DATABASE_URL=mongodb://127.0.0.1:27017/interviewportal
OPENAI_API_KEY=your-openai-api-key-here
NODE_ENV=development
```

- `DATABASE_URL` – MongoDB connection string (defaults to `mongodb://127.0.0.1:27017` if not set).  
- `OPENAI_API_KEY` – required for the AI description generation feature.

The project uses `dotenv` via `import "dotenv/config";` in `server/index.ts`, so these values are loaded automatically.

---

## Installation & Running Locally

From the project root (`InterviewPortal`), install dependencies for both client and server and run them:

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Run the backend (server)

From the `server` directory:

```bash
# Compile TypeScript then run compiled JS
npm run build
npm start

# OR run in dev mode with ts-node / nodemon
npm run dev        # single run with ts-node
npm run dev:watch  # auto-restart on changes
```

By default, the server listens on **http://localhost:8000**.

### 3. Run the frontend (client)

From the `client` directory:

```bash
npm start
```

The React app runs on **http://localhost:3000** and is pre-configured to talk to the backend at `http://localhost:8000` (see `server/index.ts` CORS config).

---

## Core Flows

### Schedule a New Interview

1. Open the app at `http://localhost:3000`.
2. Go to the **Schedule Interview** page.
3. Fill in:
   - Interview title  
   - Role  
   - Company name  
   - Role description  
   - Company description  
   - Date, start time, end time  
4. Click **Check Available Participants** to fetch users who are free in that time window.
5. Select at least **2 participants**.
6. Click **Schedule Interview** to create the interview.

### Edit an Existing Interview

1. Go to the **Upcoming Interviews** page.
2. Select an interview to edit.
3. Modify fields (including company/role descriptions, time window, participants).
4. Click **Check Available Participants** again if you change the time.
5. Click **Update Interview** to save.

### AI Description Generation

On both **Schedule Interview** and **Edit Interview** pages:

1. Enter **Company Name** and **Role**.
2. Click the **Generate Description** button next to the **Role Description** label.
3. The frontend calls the backend endpoint:
   - `POST /api/interviews/generate-descriptions`
   - Body:
     ```json
     {
       "companyName": "Example Corp",
       "role": "Senior Backend Engineer"
     }
     ```
4. The backend uses OpenAI via `server/utils/aiService.ts` to generate:
   - `companyDescription`
   - `roleDescription`
5. The React form auto-fills both text areas. You can edit them further before saving.

If the OpenAI call fails (e.g., invalid/missing API key or network issues), the API returns an error message that the UI surfaces via an alert.

---

## API Overview

Base URL: `http://localhost:8000`

### Users

- **GET** `/api/users/`  
  Returns the list of users (emails) that can be invited to interviews.

### Interviews

- **POST** `/api/interviews/available`  
  Check available users in a time window.
  - Body:
    ```json
    {
      "startTime": "2026-01-10T10:00:00.000Z",
      "endTime": "2026-01-10T11:00:00.000Z"
    }
    ```

- **POST** `/api/interviews/`  
  Create a new interview.
  - Body:
    ```json
    {
      "title": "System Design Interview",
      "role": "Senior Backend Engineer",
      "companyName": "Example Corp",
      "roleDescription": "Short description...",
      "companyDescription": "Short company description...",
      "startTime": "2026-01-10T10:00:00.000Z",
      "endTime": "2026-01-10T11:00:00.000Z",
      "usersInvited": ["user1@example.com", "user2@example.com"]
    }
    ```

- **GET** `/api/interviews/upcoming`  
  Get upcoming interviews.

- **GET** `/api/interviews/:interviewId`  
  Get a single interview by id.

- **PUT** `/api/interviews/:interviewId`  
  Update an existing interview (same shape as create body).

- **DELETE** `/api/interviews/:interviewId`  
  Delete an interview.

- **POST** `/api/interviews/generate-descriptions`  
  Generate AI-based descriptions from company and role.
  - Body:
    ```json
    {
      "companyName": "Example Corp",
      "role": "Senior Backend Engineer"
    }
    ```
  - Response:
    ```json
    {
      "companyDescription": "…",
      "roleDescription": "…"
    }
    ```

---

## Error Handling

- All API errors are centralized via `server/middlewares/errorHandler.ts`.
- Responses include:
  - `message`: human-readable error message
  - `stack`: in non-production environments, the stack trace for debugging
- The client surfaces these errors primarily as alerts when actions fail.

---

## Scripts Reference

### Client (`client/package.json`)

- `npm start` – start React dev server
- `npm run build` – production build
- `npm test` – run tests (CRA default)

### Server (`server/package.json`)

- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run compiled server (`dist/index.js`) with nodemon
- `npm run dev` – run `index.ts` with ts-node
- `npm run dev:watch` – run `index.ts` with nodemon + ts-node


This README is intended as a living document—update it as you add features or change behavior.

