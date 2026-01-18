# Stowaway - Claude Instructions

## Project Overview

Modern web-based inventory management system built with Next.js, Prisma, and SQLite. This is a complete rewrite of the original Java/JavaFX desktop application as a modern, GitHub-ready web application.

## Technology Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v5 (credentials provider)
- **Styling**: Tailwind CSS + shadcn/ui components
- **QR/Barcode**: qrcode (generation) + @zxing/browser (scanning)
- **Testing**: Vitest + Playwright

## Key Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio GUI
npx prisma migrate dev    # Run migrations
npx prisma generate  # Generate Prisma client

# Testing
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests

# Docker
docker-compose up    # Start with Docker
```

## Project Structure

```
stowaway/
├── .github/workflows/     # CI, Release, Docker workflows
├── prisma/                # Database schema & migrations
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (dashboard)/   # Main app pages
│   │   └── api/           # REST API routes
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── items/         # Item-related components
│   │   ├── qr/            # QR code components
│   │   ├── barcode/       # Barcode scanner
│   │   ├── layout/        # Layout components
│   │   └── providers/     # React providers
│   └── lib/               # Utilities (db, auth, validations)
├── uploads/               # Image uploads directory
└── docker-compose.yml     # Docker configuration
```

## Architecture

### Authentication Flow
1. User registers or logs in via `/login` or `/register`
2. NextAuth.js handles session management with JWT strategy
3. Middleware protects dashboard routes, redirects unauthenticated users
4. First registered user automatically becomes ADMIN

### Data Model
- **User**: Owns items, has role (USER/ADMIN)
- **Item**: Core entity with name, description, price, quantity, barcode
- **Category**: Color-coded grouping for items
- **Location**: Physical storage locations
- **ItemImage**: Multiple images per item

### API Routes
- `GET/POST /api/items` - List/create items
- `GET/PUT/DELETE /api/items/[id]` - Single item operations
- `GET/POST /api/categories` - Category management
- `GET/POST /api/locations` - Location management
- `GET /api/export` - Export data (JSON/CSV)
- `POST /api/import` - Import data

## Important Rules

1. **Keep SPECIFICATION.md up to date** - When making changes to features, API endpoints, database schema, or architecture, update SPECIFICATION.md

2. **Always run lint before committing**
   ```bash
   npm run lint
   ```

3. **Use Zod schemas for all API validation** - Schemas are in `src/lib/validations.ts`

4. **Follow existing patterns in the codebase**
   - API routes use `auth()` for session validation
   - Forms use react-hook-form with zodResolver
   - Toast notifications via sonner

5. **Database changes require migrations**
   ```bash
   npx prisma migrate dev --name description-of-change
   ```

## File Locations

| Purpose | Location |
|---------|----------|
| Database schema | `prisma/schema.prisma` |
| API routes | `src/app/api/` |
| Page components | `src/app/(dashboard)/` |
| UI components | `src/components/ui/` |
| Feature components | `src/components/[feature]/` |
| Utilities | `src/lib/` |
| Validation schemas | `src/lib/validations.ts` |
| Auth configuration | `src/lib/auth.ts` |
| Database client | `src/lib/db.ts` |

## Common Tasks

### Adding a new API endpoint
1. Create route file in `src/app/api/[endpoint]/route.ts`
2. Add Zod validation schema in `src/lib/validations.ts`
3. Use `auth()` to validate session
4. Return proper HTTP status codes
5. Update SPECIFICATION.md

### Adding a new page
1. Create page in `src/app/(dashboard)/[page]/page.tsx`
2. Add navigation link in `src/components/layout/sidebar.tsx`
3. Create any required components in `src/components/`

### Adding a new database model
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add-model-name`
3. Update related API routes
4. Update SPECIFICATION.md

## Environment Variables

Required variables in `.env`:
```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
```

Optional:
```
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
```

## Troubleshooting

### Prisma client not found
```bash
npx prisma generate
```

### Database out of sync
```bash
npx prisma migrate reset
```

### Build fails
- Ensure all dependencies are installed: `npm ci`
- Regenerate Prisma client: `npx prisma generate`
- Check for TypeScript errors: `npx tsc --noEmit`
