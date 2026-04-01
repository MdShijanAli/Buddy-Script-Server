# JWT Token System Documentation

## Overview
Your API now supports JWT tokens with access & refresh token functionality. Users get tokens automatically on signup/signin and can refresh expired access tokens.

## Environment Variables
Add these to your `.env` file:

```env
# Token Secrets (use strong random strings in production)
ACCESS_TOKEN_SECRET=your-super-secret-access-key-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-this
```

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Features
- ✅ Auto-generate tokens on signup/signin
- ✅ 15-minute access tokens
- ✅ 7-day refresh tokens
- ✅ Refresh endpoint to get new access tokens
- ✅ Token verification middleware

## API Endpoints

### 1. Sign Up (POST `/api/auth/sign-up`)
**Request:**
```json
{
  "first_name": "Md Shijan",
  "last_name": "Ali",
  "email": "user@example.com",
  "password": "Password123@"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "Md Shijan Ali",
    "role": "USER",
    ...
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. Sign In (POST `/api/auth/sign-in`)
Same response format as signup with tokens included.

### 3. Refresh Token (POST `/api/token/refresh`)
**Request:**
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

## Using Tokens in Requests

### As Bearer Token (Recommended)
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.example.com/api/users/profile
```

### As Cookie
```bash
curl -b "accessToken=YOUR_ACCESS_TOKEN" \
  https://api.example.com/api/users/profile
```

## Protected Routes

### Verify Token Middleware
To protect routes, use the `verifyToken` middleware:

```typescript
import { verifyToken } from "../middlewares/verifyToken";
import { Router } from "express";

const router = Router();

// Protected route
router.get("/profile", verifyToken, (req, res) => {
  console.log(req.user); // { userId, email, role }
  res.json({ user: req.user });
});

export default router;
```

### Optional Token Verification
Some routes might work with or without tokens:

```typescript
import { optionalVerifyToken } from "../middlewares/verifyToken";

router.get("/posts", optionalVerifyToken, (req, res) => {
  if (req.user) {
    // Authenticated request
  } else {
    // Anonymous request
  }
});
```

## Token Flow Diagram

```
1. User Sign Up/Sign In
   ↓
2. Server creates tokens
   ├─ accessToken (15m)
   └─ refreshToken (7d)
   ↓
3. Client stores tokens
   ├─ accessToken in memory/sessionStorage
   └─ refreshToken in secure httpOnly cookie
   ↓
4. Client makes request with accessToken
   "Authorization: Bearer {accessToken}"
   ↓
5. Token expires after 15 minutes
   ↓
6. Client calls /api/token/refresh
   ↓
7. Server validates refreshToken
   ↓
8. Server returns new tokens
   ↓
9. Client updates accessToken and continues
```

## Error Handling

### Token Expired
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "code": "TOKEN_INVALID"
}
```

### No Token Provided
```json
{
  "success": false,
  "message": "No token provided",
  "code": "UNAUTHORIZED"
}
```

### Invalid Refresh Token
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "code": "REFRESH_TOKEN_INVALID"
}
```

## Frontend Implementation Example

```typescript
// Store tokens
localStorage.setItem('accessToken', response.tokens.accessToken);
localStorage.setItem('refreshToken', response.tokens.refreshToken);

// Use token in requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
};

// Refresh token when needed
async function refreshToken() {
  const response = await fetch('/api/token/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: localStorage.getItem('refreshToken')
    })
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }
}
```

## Security Best Practices
- ✅ Use HTTPS only in production
- ✅ Store access tokens in memory or sessionStorage
- ✅ Store refresh tokens in httpOnly secure cookies
- ✅ Use strong, random secrets for token signing
- ✅ Set appropriate token expiry times
- ✅ Validate tokens on every protected route
