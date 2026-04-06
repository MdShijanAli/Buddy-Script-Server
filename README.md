# Buddy Script Server

Backend API for Buddy Script, built with Express, TypeScript, Prisma, PostgreSQL, JWT auth, and Better Auth.

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Better Auth
- JWT (access + refresh token flow)
- Multer (image uploads)

## Features

- Authentication: sign up, sign in, sign out
- Token refresh endpoint
- User profile read/update
- Post CRUD with image upload support
- Comment and reply APIs
- Like/unlike for post, comment, and reply
- Static file serving for uploaded images

## Project Structure

```text
src/
	app.ts
	server.ts
	config/
		env.ts
	lib/
		auth.ts
		prisma.ts
		tokens.ts
	middlewares/
		auth.ts
		upload.ts
	modules/
		auth/
		token/
		user/
		post/
		comment/
		reply/
		like/
prisma/
	schema/
	migrations/
uploads/
	posts/
	profiles/
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database

## Environment Variables

Create a `.env` file in the root with:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
CLIENT_URL=http://localhost:5173

BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

All environment variables above are required by [src/config/env.ts](src/config/env.ts).

## Installation & Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npm run generate
```

3. Run migrations

```bash
npm run migrate
```

4. Start development server

```bash
npm run dev
```

Server runs at `http://localhost:5000` by default.

## Available Scripts

- `npm run dev` - Start dev server with watch mode
- `npm run build` - Generate Prisma client and compile TypeScript
- `npm run start` - Run built server
- `npm run migrate` - Apply Prisma migrations in development
- `npm run generate` - Generate Prisma client
- `npm run reset:db` - Reset database and reapply migrations
- `npm run show:db` - Open Prisma Studio
- `npm run seed:admin` - Seed admin user
- `npm run backfill:comments-count` - Backfill comment counters
- `npm run generate:auth` - Run Better Auth generate command

## API Base URL

`/api`

Health check:

- `GET /api/health`

## Authentication

Protected routes expect this header:

```http
Authorization: Bearer <access_token>
```

## Endpoint Summary

### Auth

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`

### Token

- `POST /api/token/refresh`

Request body:

```json
{
  "refreshToken": "your_refresh_token"
}
```

### Users

- `GET /api/users/profile` (protected)
- `PUT /api/users/profile` (protected, supports multipart form data)

Profile update fields:

- `name`
- `first_name`
- `last_name`
- `phone`
- `bio`
- `location`
- `removeProfileImage` (true/"true"/1/"1" to remove existing image)
- file fields: `profile_image` (preferred), `image`, `file`

Example JSON body:

```json
{
  "name": "Md Shijan Ali",
  "first_name": "Md",
  "last_name": "Shijan",
  "phone": "+8801712345678",
  "bio": "Backend developer",
  "location": "Dhaka"
}
```

### Posts

- `POST /api/posts` (protected, multipart)
- `PUT /api/posts/:postId` (protected, multipart)
- `GET /api/posts` (protected)
- `GET /api/posts/my-posts` (protected)
- `DELETE /api/posts/:postId` (protected)

Update supports `removeImage` (true/"true"/1/"1") to clear post image.

### Comments

- `POST /api/comments/:postId` (protected, multipart)
- `GET /api/comments/:postId` (protected)
- `PUT /api/comments/:commentId` (protected, multipart)
- `DELETE /api/comments/:commentId` (protected)

### Replies

- `POST /api/replies/:commentId` (protected, multipart)
- `GET /api/replies/:commentId` (protected)
- `PUT /api/replies/:replyId` (protected)
- `DELETE /api/replies/:replyId` (protected)

### Likes

- `POST /api/likes/post/:postId` (protected)
- `GET /api/likes/post/:postId` (protected)
- `POST /api/likes/comment/:commentId` (protected)
- `GET /api/likes/comment/:commentId` (protected)
- `POST /api/likes/reply/:replyId` (protected)
- `GET /api/likes/reply/:replyId` (protected)
- `DELETE /api/likes/:likeId` (protected)

## Static Uploads

Uploaded files are served from:

- `/uploads/posts/...`
- `/uploads/profiles/...`

Configured in [src/app.ts](src/app.ts).

## Notes

- CORS origin is read from `CLIENT_URL`.
- If startup fails with env errors, verify all required variables in `.env`.
- If Prisma types are out of date after schema changes, run `npm run generate`.

## Author

Md Shijan Ali
