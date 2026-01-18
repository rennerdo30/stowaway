# Contributing

Thank you for your interest in contributing to Stowaway! This guide will help you get started.

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/yourusername/stowaway.git
cd stowaway
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Development Workflow

### Code Style

- We use ESLint for code linting
- Run `npm run lint` before committing
- Follow existing code patterns
- Use TypeScript strict mode

### Commit Messages

Use clear, descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add barcode scanning feature
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add unit tests for item API
```

### Pull Request Process

1. Update documentation if needed
2. Run tests: `npm test`
3. Run linter: `npm run lint`
4. Ensure build passes: `npm run build`
5. Create a pull request with a clear description

---

## Project Structure

```
stowaway/
├── docs/                # Documentation (MkDocs)
├── prisma/              # Database schema & migrations
├── public/              # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/     # Authentication pages
│   │   ├── (dashboard)/ # Main application
│   │   └── api/        # REST API routes
│   ├── components/
│   │   ├── ui/         # shadcn/ui components
│   │   └── [feature]/  # Feature components
│   └── lib/            # Utilities
└── uploads/            # User uploads
```

---

## Adding Features

### New API Endpoint

1. Create route in `src/app/api/[endpoint]/route.ts`
2. Add Zod schema in `src/lib/validations.ts`
3. Use `auth()` for session validation
4. Update `SPECIFICATION.md`
5. Add API documentation

### New Page

1. Create page in `src/app/(dashboard)/[page]/page.tsx`
2. Add navigation link in `src/components/layout/sidebar.tsx`
3. Create required components

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Update related routes and components
4. Update documentation

---

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

---

## Documentation

Documentation is built with MkDocs and hosted on GitHub Pages.

### Local Preview

```bash
# Install Python dependencies
pip install -r requirements.txt

# Serve documentation locally
mkdocs serve

# Open http://localhost:8000
```

### Building Docs

```bash
mkdocs build
```

---

## Questions?

- Open an issue for questions or discussion
- Join discussions on GitHub

---

## Code of Conduct

Be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
