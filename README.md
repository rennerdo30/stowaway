# Stowaway

A modern, self-hosted web application for managing your inventory. Track items, categories, locations, and quantities with ease.

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

# Start with Docker Compose
docker-compose up -d

# Open http://localhost:3000
```

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

# Open http://localhost:3000
```

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

# Run tests
npm test

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Screenshots

*Coming soon*

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide](https://lucide.dev/) for the icon set
- [ZXing](https://github.com/zxing-js/library) for barcode scanning
