# Athena Frontend

Athena Frontend is the React + Next.js client application for the Athena project. This project currently connects to the backend categories API and renders category data on the frontend.

## Project overview

- Language: TypeScript
- Frontend framework: Next.js
- UI library: React
- Styling: Tailwind CSS
- Runtime: Node.js
- Package manager: npm
- Architecture: App Router (Next.js app folder)

## Tech stack used

### Core technologies
- Node.js (runtime for JavaScript/TypeScript execution)
- npm (dependency management)
- TypeScript (typed JavaScript)
- React 19
- Next.js 16
- Tailwind CSS

### Project tooling
- ESLint
- TypeScript compiler
- Next.js development server
- Environment variables via `.env.local`

## Prerequisites

Before setting up the project on a new system, install the following:

1. Node.js (recommended LTS version)
2. npm (comes with Node.js)
3. Git
4. A local backend running at `http://localhost:8000`

## Required dependencies

The project uses these dependencies:

```json
{
  "next": "16.3.1",
  "react": "19.2.8",
  "react-dom": "19.2.8"
}
```

And these development dependencies:

```json
{
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.3.1",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

## Local setup

1. Clone the repository.
2. Open the project folder:

```bash
cd athena-frontend
```

3. Install dependencies:

```bash
npm install
```

4. Create environment file from the example:

```bash
cp .env.example .env.local
```

5. Confirm the backend is running.

6. Start the app:

```bash
npm run dev
```

7. Open the app in the browser:

```text
http://localhost:3000
```

## Environment variables

The frontend uses a single environment variable for the backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The file [.env.example](.env.example) contains the default value.

## Backend API connection

The frontend is currently connected to the backend endpoint:

- `GET http://localhost:8000/categories`
- Swagger docs: `http://localhost:8000/docs`

### Expected response format

```json
[
  {
    "id": 1,
    "name": "Textiles",
    "product_types": ["Jeans", "T-Shirt", "Jacket", "Dress", "Sweater", "Shoes"]
  },
  {
    "id": 2,
    "name": "Electronics",
    "product_types": ["Smartphone", "Tablet", "Laptop", "Hair dryer"]
  }
]
```

## Current project structure

```text
athena-frontend/
├── app/
├── components/
│   └── repairs/
├── hooks/
├── services/
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── public/
```

## Notes for handover

This frontend is a starter implementation for the Athena project and is set up to consume backend data from a FastAPI-style service running locally on port 8000. The code currently includes:

- API service layer for fetching categories
- custom hook for data fetching and loading state
- reusable card component for displaying category data
- environment variable configuration

## Useful commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Important reminder

To run the frontend successfully, the backend must already be running locally on `http://localhost:8000` and CORS must be enabled on the backend for browser requests from `http://localhost:3000`.
