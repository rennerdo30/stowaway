# Contributing to Stowaway

Thank you for your interest in contributing to Stowaway! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/stowaway.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Set up your environment: `cp .env.example .env`
6. Run migrations: `npx prisma migrate dev`
7. Start development server: `npm run dev`

## Development Workflow

### Code Style

- We use ESLint for code linting
- Run `npm run lint` before committing
- Follow the existing code patterns in the codebase
- Use TypeScript strict mode

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add barcode scanning feature
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add unit tests for item API
```

### Pull Request Process

1. Update the documentation (SPECIFICATION.md, README.md) if needed
2. Run all tests: `npm test`
3. Run linter: `npm run lint`
4. Ensure the build passes: `npm run build`
5. Create a pull request with a clear description of changes

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── (auth)/         # Authentication pages
│   ├── (dashboard)/    # Main application pages
│   └── api/            # REST API endpoints
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── [feature]/     # Feature-specific components
└── lib/               # Utilities and configurations
    ├── auth.ts        # NextAuth configuration
    ├── db.ts          # Prisma client
    └── validations.ts # Zod schemas
```

## Adding New Features

### Adding a new API endpoint

1. Create the route file in `src/app/api/[endpoint]/route.ts`
2. Add Zod validation schema in `src/lib/validations.ts`
3. Use `auth()` for session validation
4. Update SPECIFICATION.md with the new endpoint

### Adding a new page

1. Create the page in `src/app/(dashboard)/[page]/page.tsx`
2. Add navigation link in `src/components/layout/sidebar.tsx`
3. Create any necessary components in `src/components/`

### Modifying the database schema

1. Update `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name your-change`
3. Update related API routes and components
4. Update SPECIFICATION.md

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## Questions?

Open an issue for questions or discussion.

## Code of Conduct

Be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
