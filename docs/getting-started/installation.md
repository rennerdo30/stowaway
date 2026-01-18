# Installation

This guide covers the different ways to install and run Stowaway.

## Requirements

- **Node.js 18+** (for manual installation)
- **Docker & Docker Compose** (for containerized deployment)

---

## Docker Installation (Recommended)

The easiest way to run Stowaway is with Docker Compose.

### 1. Clone the Repository

```bash
git clone https://github.com/rennerdo30/stowaway.git
cd stowaway
```

### 2. Configure Environment

Create a `.env` file with your settings:

```bash
cp .env.example .env
```

Edit `.env` and set a secure `AUTH_SECRET`:

```env
AUTH_SECRET="your-secure-random-string-here"
```

!!! tip "Generate a Secure Secret"
    Use OpenSSL to generate a secure secret:
    ```bash
    openssl rand -base64 32
    ```

### 3. Start the Application

```bash
docker-compose up -d
```

### 4. Access Stowaway

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Manual Installation

For development or custom deployments, you can run Stowaway directly with Node.js.

### 1. Clone the Repository

```bash
git clone https://github.com/rennerdo30/stowaway.git
cd stowaway
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secure-random-string-here"
AUTH_URL="http://localhost:3000"
```

### 4. Initialize Database

```bash
npx prisma migrate deploy
```

### 5. Build and Start

```bash
npm run build
npm start
```

### 6. Access Stowaway

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Mode

For active development with hot reloading:

```bash
npm run dev
```

This starts the development server with automatic recompilation on file changes.

---

## Next Steps

- [Quick Start Guide](quickstart.md) - Create your first items
- [Configuration](configuration.md) - Customize Stowaway settings
