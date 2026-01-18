# Items API

Manage inventory items programmatically.

## List Items

Get a paginated list of items with optional filtering.

### Endpoint

```
GET /api/items
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | - | Search in name, description, manufacturer, barcode |
| `categoryId` | string | - | Filter by category UUID |
| `locationId` | string | - | Filter by location UUID |
| `lowStock` | boolean | false | Only show low stock items |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `sortBy` | string | createdAt | Field to sort by |
| `sortOrder` | string | desc | Sort direction (asc/desc) |

### Example Request

```bash
curl "https://your-instance.com/api/items?search=mouse&categoryId=123&limit=10"
```

### Response

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Logitech MX Master 3",
      "description": "Wireless ergonomic mouse",
      "manufacturer": "Logitech",
      "barcode": "097855147479",
      "buyPrice": 99.99,
      "buyDate": "2024-01-15T00:00:00.000Z",
      "quantity": 2,
      "minQuantity": 1,
      "categoryId": "category-uuid",
      "locationId": "location-uuid",
      "category": {
        "id": "category-uuid",
        "name": "Electronics",
        "color": "#3b82f6"
      },
      "location": {
        "id": "location-uuid",
        "name": "Office",
        "description": "Main office area"
      },
      "images": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## Create Item

Add a new item to the inventory.

### Endpoint

```
POST /api/items
```

### Request Body

```json
{
  "name": "Logitech MX Master 3",
  "description": "Wireless ergonomic mouse with customizable buttons",
  "manufacturer": "Logitech",
  "barcode": "097855147479",
  "buyPrice": 99.99,
  "buyDate": "2024-01-15",
  "quantity": 2,
  "minQuantity": 1,
  "categoryId": "category-uuid",
  "locationId": "location-uuid"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Item name |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `description` | string | null | Item description |
| `manufacturer` | string | null | Brand/manufacturer |
| `barcode` | string | null | Product barcode (unique) |
| `buyPrice` | number | 0 | Purchase price |
| `buyDate` | string | today | ISO date string |
| `quantity` | number | 1 | Current quantity |
| `minQuantity` | number | 0 | Low stock threshold |
| `categoryId` | string | null | Category UUID |
| `locationId` | string | null | Location UUID |

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Logitech MX Master 3",
  ...
}
```

---

## Get Item

Retrieve a single item by ID.

### Endpoint

```
GET /api/items/[id]
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Logitech MX Master 3",
  "description": "Wireless ergonomic mouse",
  "manufacturer": "Logitech",
  "barcode": "097855147479",
  "buyPrice": 99.99,
  "buyDate": "2024-01-15T00:00:00.000Z",
  "quantity": 2,
  "minQuantity": 1,
  "category": { ... },
  "location": { ... },
  "images": [ ... ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Update Item

Modify an existing item.

### Endpoint

```
PUT /api/items/[id]
```

### Request Body

Include only the fields you want to update:

```json
{
  "quantity": 5,
  "buyPrice": 89.99
}
```

### Response

Returns the updated item.

---

## Delete Item

Remove an item from the inventory.

### Endpoint

```
DELETE /api/items/[id]
```

### Response

```json
{
  "success": true
}
```

!!! warning "Permanent"
    Deletion is permanent and cannot be undone. Associated images are also deleted.

---

## Item Images

### List Images

```
GET /api/items/[id]/images
```

### Upload Image

```
POST /api/items/[id]/images
Content-Type: multipart/form-data

file: (binary)
```

### Delete Image

```
DELETE /api/items/[id]/images?imageId=[imageId]
```
