# Stowaway - Technical Specification

## Overview

A modern web-based inventory management system for tracking items, their locations, categories, and quantities. Built with Next.js, Prisma, and SQLite for easy self-hosting.

## Features

### Authentication
- [x] User registration with email/password
- [x] Login with session management (NextAuth.js JWT)
- [x] Protected routes middleware
- [x] User roles (ADMIN/USER)
- [x] First user automatically becomes ADMIN

### Items Management
- [x] Create, read, update, delete items
- [x] Item fields: name, description, manufacturer, barcode, price, date, quantity
- [x] Low stock alerts (quantity <= minQuantity)
- [x] Category assignment
- [x] Location assignment
- [x] Image uploads (multiple per item)
- [x] QR code generation per item
- [x] Barcode scanning (camera-based)

### Categories
- [x] Create, read, update, delete categories
- [x] Color-coded badges
- [x] Item count display

### Locations
- [x] Create, read, update, delete locations
- [x] Optional description
- [x] Item count display

### Dashboard
- [x] Total items count
- [x] Total inventory value
- [x] Category count
- [x] Location count
- [x] Low stock alerts
- [x] Recent items list

### Data Management
- [x] Export to JSON
- [x] Export to CSV
- [x] Import from JSON
- [x] Import from CSV

### UI/UX
- [x] Dark/light theme toggle
- [x] Responsive design
- [x] Mobile-friendly navigation

## Database Schema

### User
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String   // bcrypt hashed
  role      Role     @default(USER)
  items     Item[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### Item
```prisma
model Item {
  id           String      @id @default(uuid())
  name         String
  description  String?
  manufacturer String?
  barcode      String?     @unique
  buyPrice     Float       @default(0)
  buyDate      DateTime    @default(now())
  quantity     Int         @default(1)
  minQuantity  Int         @default(0)
  categoryId   String?
  category     Category?
  locationId   String?
  location     Location?
  userId       String
  user         User
  images       ItemImage[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

### ItemImage
```prisma
model ItemImage {
  id        String   @id @default(uuid())
  itemId    String
  item      Item
  filename  String
  path      String
  createdAt DateTime @default(now())
}
```

### Category
```prisma
model Category {
  id    String @id @default(uuid())
  name  String @unique
  color String @default("#6366f1")
  items Item[]
}
```

### Location
```prisma
model Location {
  id          String  @id @default(uuid())
  name        String  @unique
  description String?
  items       Item[]
}
```

## API Reference

### Authentication

#### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

### Items

#### GET /api/items
List items with filtering and pagination.

**Query Parameters:**
- `search` - Search in name, description, manufacturer, barcode
- `categoryId` - Filter by category
- `locationId` - Filter by location
- `lowStock` - If "true", only show low stock items
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Field to sort by (default: createdAt)
- `sortOrder` - "asc" or "desc" (default: desc)

**Response:** `200 OK`
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

#### POST /api/items
Create a new item.

**Request:**
```json
{
  "name": "Item Name",
  "description": "Optional description",
  "manufacturer": "Optional manufacturer",
  "barcode": "1234567890123",
  "buyPrice": 29.99,
  "buyDate": "2024-01-15",
  "quantity": 10,
  "minQuantity": 5,
  "categoryId": "uuid",
  "locationId": "uuid"
}
```

**Response:** `201 Created`

#### GET /api/items/[id]
Get a single item.

**Response:** `200 OK`

#### PUT /api/items/[id]
Update an item.

**Response:** `200 OK`

#### DELETE /api/items/[id]
Delete an item.

**Response:** `200 OK`

### Item Images

#### GET /api/items/[id]/images
List images for an item.

#### POST /api/items/[id]/images
Upload a new image.

**Request:** `multipart/form-data` with `file` field

#### DELETE /api/items/[id]/images?imageId=uuid
Delete an image.

### Categories

#### GET /api/categories
List all categories.

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Electronics",
      "color": "#3b82f6",
      "_count": { "items": 15 }
    }
  ]
}
```

#### POST /api/categories
Create a category.

**Request:**
```json
{
  "name": "Electronics",
  "color": "#3b82f6"
}
```

#### PUT /api/categories/[id]
Update a category.

#### DELETE /api/categories/[id]
Delete a category.

### Locations

#### GET /api/locations
List all locations.

#### POST /api/locations
Create a location.

**Request:**
```json
{
  "name": "Warehouse A",
  "description": "Main storage facility"
}
```

#### PUT /api/locations/[id]
Update a location.

#### DELETE /api/locations/[id]
Delete a location.

### Export/Import

#### GET /api/export?format=json|csv
Export all data.

#### POST /api/import
Import data from JSON or CSV file.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "itemsImported": 50,
  "categoriesImported": 5,
  "locationsImported": 3
}
```

## Component Hierarchy

```
App
├── Providers (Session, Theme, Toaster)
├── (auth) Layout
│   ├── LoginPage
│   └── RegisterPage
└── (dashboard) Layout
    ├── Sidebar
    ├── DashboardPage
    ├── ItemsPage
    │   ├── DataTable
    │   └── ItemForm
    ├── ItemDetailPage
    │   └── ItemActions
    ├── CategoriesPage
    ├── LocationsPage
    └── SettingsPage
```

## Security Considerations

1. **Authentication**
   - Passwords hashed with bcrypt (12 rounds)
   - JWT-based sessions
   - CSRF protection via NextAuth.js

2. **Authorization**
   - All API routes check session
   - Users can only access their own items
   - Middleware protects dashboard routes

3. **File Uploads**
   - File type validation (JPEG, PNG, GIF, WebP only)
   - File size limits (configurable, default 5MB)
   - Files stored outside web root

4. **Input Validation**
   - Zod schemas for all inputs
   - SQL injection prevented by Prisma ORM
   - XSS prevented by React auto-escaping

## Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Node.js Standalone
```bash
npm ci
npx prisma migrate deploy
npm run build
npm start
```

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | SQLite database path |
| AUTH_SECRET | Yes | - | NextAuth.js secret |
| AUTH_URL | No | http://localhost:3000 | Application URL |
| UPLOAD_DIR | No | ./uploads | Image upload directory |
| MAX_FILE_SIZE | No | 5242880 | Max upload size (bytes) |
