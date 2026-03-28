# Second Brain

Second Brain is a full-stack app where users can store and organize content links from multiple sources in one place (Twitter/X, YouTube, docs, and more).

## Current Status

Implemented so far:

1. Backend authentication with signup/signin
2. Password hashing with bcrypt
3. Request validation with Zod (moved to a dedicated validators file)
4. JWT-based protected routes via middleware
5. Content create/list/delete routes
6. Shareable brain link create/remove/read routes
7. Prisma-based persistence (Mongoose removed)

## Project Structure

1. Frontend (Next.js): app
2. Backend (Express + Prisma): backend

## Prerequisites

1. Node.js 20+
2. npm
3. PostgreSQL (or a valid Postgres-compatible DATABASE_URL)

## Environment Variables

Create or update backend/.env with:

DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
JWT_PASSWORD="replace-with-a-strong-secret"

## Backend Setup

From the backend directory:

1. npm install
2. npx prisma generate
3. npx prisma migrate dev --name init
4. npm run dev

Backend runs on port 3000 by default.

## Frontend Setup


From the project root:

1. npm install
2. npm run dev

Frontend runs on port 4000 by default.

### Frontend Architecture

**Technology Stack:**
- Next.js 16.2.1 with React 19.2.4
- TypeScript 5
- Axios for API calls
- Plain CSS for styling (no Tailwind)

**Key Files:**
- `app/page.tsx` - Root page with authentication check (shows LoginPage or Dashboard)
- `app/layout.tsx` - Root layout with global styles
- `app/styles.css` - All application styling
- `lib/api.ts` - Centralized API client with automatic Bearer token injection
- `app/share/[hash]/page.tsx` - Public shared brain view page

**Components:**
- `components/LoginPage.tsx` - Signup/Signin form with toggle between modes
- `components/Dashboard.tsx` - Main authenticated app with content grid and filters
- `components/Sidebar.tsx` - Navigation with content type filters
- `components/ContentCard.tsx` - Individual content item display
- `components/AddContentModal.tsx` - Modal for adding new content
- `components/ShareModal.tsx` - Modal for generating shareable links

**Features:**
- JWT-based authentication (token stored in localStorage)
- Protected routes (dashboard only accessible with valid token)
- Content filtering by type (Tweets, Videos, Documents, Links, Tags)
- Add/delete content functionality
- Share brain with unique hash link
- Responsive design with sidebar navigation

### Environment Variables

Frontend uses one environment variable in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

This points to the backend API server.
## API Routes (Implemented)

Public routes:

1. POST /api/v1/signup
2. POST /api/v1/signin
3. GET /api/v1/brain/:shareLink

Protected routes (Authorization: Bearer <token>):

1. POST /api/v1/content
2. GET /api/v1/content
3. DELETE /api/v1/content
4. POST /api/v1/brain/share


## Notes

1. Zod schemas are defined in backend/src/validators.ts
2. Express request userId typing is handled in backend/src/express.d.ts
3. JWT middleware is in backend/src/middleware.ts
4. Prisma client initialization is in backend/src/db.ts
