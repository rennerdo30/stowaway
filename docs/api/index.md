# API Reference

Stowaway provides a REST API for programmatic access to your inventory data.

## Base URL

All API endpoints are relative to your Stowaway installation:

```
https://your-stowaway-instance.com/api
```

## Authentication

All API requests require authentication via session cookies.

!!! note "Session-Based Auth"
    The API uses the same session authentication as the web interface. You must be logged in to make API requests.

For programmatic access, you can authenticate by:

1. Logging in via the web interface
2. Using the session cookie in subsequent API requests

---

## Response Format

All responses are JSON formatted.

### Success Response

```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "error": "Error message here"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Not logged in |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Endpoints Overview

### Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/items` | List items |
| `POST` | `/api/items` | Create item |
| `GET` | `/api/items/[id]` | Get item |
| `PUT` | `/api/items/[id]` | Update item |
| `DELETE` | `/api/items/[id]` | Delete item |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/[id]` | Update category |
| `DELETE` | `/api/categories/[id]` | Delete category |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/locations` | List locations |
| `POST` | `/api/locations` | Create location |
| `PUT` | `/api/locations/[id]` | Update location |
| `DELETE` | `/api/locations/[id]` | Delete location |

### Data Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/export?format=json` | Export data as JSON |
| `GET` | `/api/export?format=csv` | Export data as CSV |
| `POST` | `/api/import` | Import data |

---

## Rate Limiting

Currently, there are no rate limits on the API. However, please be considerate and avoid excessive requests.

---

## Next Steps

- [Authentication](authentication.md) - Detailed auth documentation
- [Items API](items.md) - Item endpoints
- [Categories API](categories.md) - Category endpoints
- [Locations API](locations.md) - Location endpoints
