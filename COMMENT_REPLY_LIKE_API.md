# Comment & Reply APIs Documentation

## Overview

Complete CRUD APIs for comments and replies on posts with full like/unlike functionality.

---

## Comment APIs

### 1. Create Comment

**POST** `/api/comments/:postId`

```json
Headers: Authorization: Bearer <token>

Request Body:
{
  "content": "This is a great post!"
}

Response (201):
{
  "success": true,
  "message": "Comment created successfully",
  "comment": {
    "id": "clv9x1a2b3c4d5e6f7g8h9i0j",
    "postId": "post-id",
    "authorId": "user-id",
    "content": "This is a great post!",
    "likesCount": 0,
    "createdAt": "2025-04-02T10:30:00.000Z",
    "updatedAt": "2025-04-02T10:30:00.000Z",
    "author": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### 2. Get Comments for Post

**GET** `/api/comments/:postId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Comments retrieved successfully",
  "comments": [
    {
      "id": "comment-id",
      "postId": "post-id",
      "authorId": "user-id",
      "content": "Great post!",
      "likesCount": 5,
      "createdAt": "2025-04-02T10:30:00.000Z",
      "updatedAt": "2025-04-02T10:30:00.000Z",
      "author": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "replies": [
        {
          "id": "reply-id",
          "commentId": "comment-id",
          "authorId": "another-user-id",
          "content": "Thanks for the comment!",
          "likesCount": 2,
          "createdAt": "2025-04-02T11:00:00.000Z",
          "updatedAt": "2025-04-02T11:00:00.000Z",
          "author": {
            "id": "another-user-id",
            "email": "another@example.com",
            "name": "Jane Smith"
          }
        }
      ]
    }
  ]
}
```

### 3. Update Comment (Author Only)

**PUT** `/api/comments/:commentId`

```json
Headers: Authorization: Bearer <token>

Request Body:
{
  "content": "Updated comment text"
}

Response (200):
{
  "success": true,
  "message": "Comment updated successfully",
  "comment": { ... }
}

Error (403):
{
  "success": false,
  "message": "You can only update your own comments",
  "code": "UNAUTHORIZED"
}

Error (404):
{
  "success": false,
  "message": "Comment not found",
  "code": "COMMENT_NOT_FOUND"
}
```

### 4. Delete Comment (Author Only)

**DELETE** `/api/comments/:commentId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Comment deleted successfully"
}

Error (403):
{
  "success": false,
  "message": "You can only delete your own comments",
  "code": "UNAUTHORIZED"
}
```

---

## Reply APIs

### 1. Create Reply

**POST** `/api/replies/:commentId`

```json
Headers: Authorization: Bearer <token>

Request Body:
{
  "content": "Thanks for the comment!"
}

Response (201):
{
  "success": true,
  "message": "Reply created successfully",
  "reply": {
    "id": "reply-id",
    "commentId": "comment-id",
    "authorId": "user-id",
    "content": "Thanks for the comment!",
    "likesCount": 0,
    "createdAt": "2025-04-02T11:00:00.000Z",
    "updatedAt": "2025-04-02T11:00:00.000Z",
    "author": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "Jane Smith"
    }
  }
}
```

### 2. Get Replies for Comment

**GET** `/api/replies/:commentId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Replies retrieved successfully",
  "replies": [
    {
      "id": "reply-id",
      "commentId": "comment-id",
      "authorId": "user-id",
      "content": "Great comment!",
      "likesCount": 3,
      "createdAt": "2025-04-02T11:00:00.000Z",
      "updatedAt": "2025-04-02T11:00:00.000Z",
      "author": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "Jane Smith"
      }
    }
  ]
}
```

### 3. Update Reply (Author Only)

**PUT** `/api/replies/:replyId`

```json
Headers: Authorization: Bearer <token>

Request Body:
{
  "content": "Updated reply text"
}

Response (200):
{
  "success": true,
  "message": "Reply updated successfully",
  "reply": { ... }
}

Error (403):
{
  "success": false,
  "message": "You can only update your own replies",
  "code": "UNAUTHORIZED"
}

Error (404):
{
  "success": false,
  "message": "Reply not found",
  "code": "REPLY_NOT_FOUND"
}
```

### 4. Delete Reply (Author Only)

**DELETE** `/api/replies/:replyId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Reply deleted successfully"
}

Error (403):
{
  "success": false,
  "message": "You can only delete your own replies",
  "code": "UNAUTHORIZED"
}
```

---

## Like APIs (Extended for Comments & Replies)

### 1. Like a Comment

**POST** `/api/likes/comment/:commentId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Comment liked successfully",
  "like": {
    "id": "like-id",
    "createdAt": "2025-04-02T11:30:00.000Z",
    "comment": {
      "id": "comment-id",
      "content": "Great post!",
      "likesCount": 6,
      "author": {
        "id": "user-id",
        "name": "John Doe"
      }
    }
  }
}

Error (400):
{
  "success": false,
  "message": "You have already liked this comment",
  "code": "ALREADY_LIKED"
}
```

### 2. Like a Reply

**POST** `/api/likes/reply/:replyId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Reply liked successfully",
  "like": {
    "id": "like-id",
    "createdAt": "2025-04-02T11:30:00.000Z",
    "reply": {
      "id": "reply-id",
      "content": "Thanks!",
      "likesCount": 4,
      "author": {
        "id": "user-id",
        "name": "Jane Smith"
      }
    }
  }
}

Error (400):
{
  "success": false,
  "message": "You have already liked this reply",
  "code": "ALREADY_LIKED"
}
```

### 3. Unlike (Works for All Types)

**DELETE** `/api/likes/:likeId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Like removed successfully",
  "like": {
    "id": "like-id",
    "createdAt": "2025-04-02T11:30:00.000Z",
    "comment": {  // or post/reply depending on type
      "id": "comment-id",
      "content": "Great post!",
      "likesCount": 5,  // count decremented
      "author": {
        "id": "user-id",
        "name": "John Doe"
      }
    }
  }
}

Error (404):
{
  "success": false,
  "message": "Like not found",
  "code": "LIKE_NOT_FOUND"
}
```

### 4. Get Likes for Comment

**GET** `/api/likes/comment/:commentId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Likes retrieved successfully",
  "likes": [
    {
      "id": "like-id",
      "userId": "user-id",
      "commentId": "comment-id",
      "postId": null,
      "replyId": null,
      "createdAt": "2025-04-02T11:30:00.000Z",
      "user": {
        "id": "user-id",
        "name": "User Name",
        "profile_image": "url"
      }
    }
  ]
}
```

### 5. Get Likes for Reply

**GET** `/api/likes/reply/:replyId`

```json
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Likes retrieved successfully",
  "likes": [
    {
      "id": "like-id",
      "userId": "user-id",
      "commentId": null,
      "postId": null,
      "replyId": "reply-id",
      "createdAt": "2025-04-02T11:30:00.000Z",
      "user": {
        "id": "user-id",
        "name": "User Name",
        "profile_image": "url"
      }
    }
  ]
}
```

### 6. Like a Post (Existing)

**POST** `/api/likes/post/:postId`

```json
Headers: Authorization: Bearer <token>

Response (200): Similar structure with post data
```

### 7. Get Likes for Post (Existing)

**GET** `/api/likes/post/:postId`

```json
Headers: Authorization: Bearer <token>

Response (200): Returns array of likes for the post
```

---

## File Structure

```
src/modules/
├── comment/
│   ├── comment.controller.ts   ✅ CRUD operations for comments
│   ├── comment.service.ts      ✅ Database queries
│   └── comment.route.ts        ✅ Route endpoints
├── reply/
│   ├── reply.controller.ts     ✅ CRUD operations for replies
│   ├── reply.service.ts        ✅ Database queries
│   └── reply.route.ts          ✅ Route endpoints
└── like/
    ├── like.controller.ts      ✅ Like/unlike for posts, comments, replies
    ├── like.service.ts         ✅ Database + count updates
    └── like.route.ts           ✅ Route endpoints
```

---

## Key Features

✅ Full CRUD for comments and replies
✅ Nested replies in comments
✅ Authorization checks (author-only edit/delete)
✅ Like/unlike functionality for all content types
✅ Like count auto-increment/decrement
✅ Get likes list for any content type
✅ Prevent duplicate likes
✅ Consistent error handling
✅ Proper HTTP status codes

---

## Error Codes

| Code                        | HTTP Status | Description                    |
| --------------------------- | ----------- | ------------------------------ |
| `AUTH_REQUIRED`             | 401         | User not authenticated         |
| `UNAUTHORIZED`              | 403         | User not authorized for action |
| `POST_ID_REQUIRED`          | 400         | Post ID missing                |
| `COMMENT_ID_REQUIRED`       | 400         | Comment ID missing             |
| `REPLY_ID_REQUIRED`         | 400         | Reply ID missing               |
| `LIKE_ID_REQUIRED`          | 400         | Like ID missing                |
| `COMMENT_NOT_FOUND`         | 404         | Comment doesn't exist          |
| `REPLY_NOT_FOUND`           | 404         | Reply doesn't exist            |
| `LIKE_NOT_FOUND`            | 404         | Like doesn't exist             |
| `ALREADY_LIKED`             | 400         | User already liked this        |
| `CREATE_COMMENT_ERROR`      | 500         | Server error creating comment  |
| `UPDATE_COMMENT_ERROR`      | 500         | Server error updating comment  |
| `DELETE_COMMENT_ERROR`      | 500         | Server error deleting comment  |
| `CREATE_REPLY_ERROR`        | 500         | Server error creating reply    |
| `UPDATE_REPLY_ERROR`        | 500         | Server error updating reply    |
| `DELETE_REPLY_ERROR`        | 500         | Server error deleting reply    |
| `CREATE_COMMENT_LIKE_ERROR` | 500         | Server error liking comment    |
| `CREATE_REPLY_LIKE_ERROR`   | 500         | Server error liking reply      |
| `UNLIKE_ERROR`              | 500         | Server error removing like     |

---

## Usage Examples with cURL

### Create a comment

```bash
curl -X POST http://localhost:5000/api/comments/post-id-123 \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great post!"}'
```

### Like a comment

```bash
curl -X POST http://localhost:5000/api/likes/comment/comment-id-456 \
  -H "Authorization: Bearer your-token"
```

### Create a reply

```bash
curl -X POST http://localhost:5000/api/replies/comment-id-456 \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"content": "Thanks for commenting!"}'
```

### Get all comments for a post

```bash
curl -X GET http://localhost:5000/api/comments/post-id-123 \
  -H "Authorization: Bearer your-token"
```

### Unlike a comment

```bash
curl -X DELETE http://localhost:5000/api/likes/like-id-789 \
  -H "Authorization: Bearer your-token"
```
