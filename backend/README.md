# Portal Backend

Node.js + Express backend with LDAP authentication and MSSQL.

## Prerequisites
- Node.js 18+ (or 16+)
- MSSQL server with database `Portal`
- LDAP server accessible from backend

## Install

```
cd backend
npm install
cp .env.example .env
# edit .env values if needed
```

## Database

Run `database/schema.sql` to create tables.

## Start

```
npm run dev
```

## Auth

POST `/api/auth/login` body: `{ "username": "...", "password": "..." }`
Header: `Authorization: Bearer <token>` after login.

## Services

- GET `/api/services` (auth required, query `q` optional)
- GET `/api/services/:id` (auth required)
- POST `/api/services` (admin)
- PUT `/api/services/:id` (admin)
- DELETE `/api/services/:id` (admin)

## News

- GET `/api/news` (auth required)
- GET `/api/news/:id` (auth required)
- POST `/api/news/:id/read` (auth required)
- GET `/api/news/:id/readers` (admin)
- POST `/api/news` (admin, form-data for `coverImage` optional)
- PUT `/api/news/:id` (admin, form-data for `coverImage` optional)
- DELETE `/api/news/:id` (admin)

## Admin setup

To make a user admin, update the `Users` table:

```sql
UPDATE Users SET IsAdmin = 1 WHERE Username = 'adminuser';
```
