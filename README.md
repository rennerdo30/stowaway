# Stowaway

A modern, self-hosted web application for managing your inventory. Track items, categories, locations, and quantities with ease.

Stowaway is built for the "where did I put that, and how many are left?" problem — home labs, workshops, spare parts, hobby supplies. It runs as a single container with a SQLite file for storage, so there is no external database to operate. Each account has its own inventory, and the first account you register becomes the administrator.

## Features

- **Item Management** - Create, edit, and delete items with detailed information
- **Categories & Locations** - Organize items with color-coded categories and storage locations
- **QR Codes** - Generate QR codes for quick item access
- **Barcode Scanning** - Scan barcodes using your device camera
- **Low Stock Alerts** - Get notified when items fall below minimum quantity
- **Image Uploads** - Attach multiple photos to each item
- **Export/Import** - Backup and restore data in JSON or CSV format
- **Dark/Light Theme** - Choose your preferred color scheme
- **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/rennerdo30/stowaway.git
cd stowaway

# Set a signing secret, then start
export AUTH_SECRET="$(openssl rand -base64 32)"
docker compose up -d

# Open http://localhost:3000 and register the first account
```

`docker-compose.yml` falls back to a placeholder `AUTH_SECRET` if you do not
provide one. Set your own before exposing the app to anything but localhost.
Item data and uploads are kept in the `stowaway-data` and `stowaway-uploads`
volumes.

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/rennerdo30/stowaway.git
cd stowaway

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and set AUTH_SECRET

# Initialize database
npx prisma migrate deploy

# Build and start
npm run build
npm start

# Open http://localhost:3000 and register the first account
```

Requires Node.js 20 or newer.

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication - Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"

# File uploads (optional)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
```

## Development

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Apply schema changes during development
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

An automated test suite is not set up yet — `npm test` is a placeholder that
exits successfully. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) with [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma](https://www.prisma.io/)
- **Authentication**: [Auth.js / NextAuth v5](https://authjs.dev/) (credentials)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) on [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **Barcodes & QR**: [ZXing](https://github.com/zxing-js/library) and [node-qrcode](https://github.com/soldair/node-qrcode)

## Documentation

Longer-form docs live in [`docs/`](docs) and are built with
[Astro Starlight](https://starlight.astro.build/).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide](https://lucide.dev/) for the icon set
- [ZXing](https://github.com/zxing-js/library) for barcode scanning
