# Authentication

Stowaway uses NextAuth.js for authentication, providing secure session-based authentication.

## Registration

Create a new user account.

### Endpoint

```
POST /api/auth/register
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| name | Optional, max 100 characters |
| email | Required, valid email format |
| password | Required, min 8 characters |
| confirmPassword | Must match password |

---

## Login

Authentication is handled through NextAuth.js endpoints.

### Endpoint

```
POST /api/auth/callback/credentials
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Response

On success, a session cookie is set and user is redirected.

---

## Session

Get current session information.

### Endpoint

```
GET /api/auth/session
```

### Response

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "expires": "2024-02-15T12:00:00.000Z"
}
```

---

## Logout

End the current session.

### Endpoint

```
POST /api/auth/signout
```

---

## User Roles

### USER

Standard users can:

- View, create, edit, delete their own items
- Manage their own categories and locations
- Export/import their own data

### ADMIN

Administrators have all USER permissions plus:

- Access to all users' data
- User management (future feature)

!!! info "First User"
    The first user to register automatically becomes an ADMIN.

---

## Password Security

- Passwords are hashed using bcrypt with 12 rounds
- Passwords must be at least 8 characters
- No password is ever stored in plain text

---

## Session Security

- Sessions use JWT tokens
- Tokens are encrypted with `AUTH_SECRET`
- Sessions expire after inactivity (configurable)
- CSRF protection is enabled by default
