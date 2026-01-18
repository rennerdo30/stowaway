---
title: Home
---

<div class="hero" markdown>

# Stowaway { .hero__title }

A modern, self-hosted web application for managing your inventory. Track items, categories, locations, and quantities with ease.
{ .hero__subtitle }

<div class="hero__buttons">
[Get Started](getting-started/installation.md){ .md-button .md-button--primary }
[View on GitHub](https://github.com/rennerdo30/stowaway){ .md-button }
</div>

</div>

---

## Features { #features }

<div class="features">

<div class="feature-card">
<span class="feature-card__icon">:material-package-variant:</span>
<span class="feature-card__title">Item Management</span>
<span class="feature-card__description">Create, edit, and delete items with detailed information including prices, quantities, and descriptions.</span>
</div>

<div class="feature-card">
<span class="feature-card__icon">:material-tag-multiple:</span>
<span class="feature-card__title">Categories & Locations</span>
<span class="feature-card__description">Organize items with color-coded categories and track where everything is stored.</span>
</div>

<div class="feature-card">
<span class="feature-card__icon">:material-qrcode-scan:</span>
<span class="feature-card__title">QR & Barcode</span>
<span class="feature-card__description">Generate QR codes for quick item access and scan barcodes with your device camera.</span>
</div>

<div class="feature-card">
<span class="feature-card__icon">:material-alert:</span>
<span class="feature-card__title">Low Stock Alerts</span>
<span class="feature-card__description">Get notified when items fall below minimum quantity thresholds.</span>
</div>

<div class="feature-card">
<span class="feature-card__icon">:material-image-multiple:</span>
<span class="feature-card__title">Image Uploads</span>
<span class="feature-card__description">Attach multiple photos to each item for easy identification.</span>
</div>

<div class="feature-card">
<span class="feature-card__icon">:material-export:</span>
<span class="feature-card__title">Export/Import</span>
<span class="feature-card__description">Backup and restore data in JSON or CSV format for easy migration.</span>
</div>

</div>

---

## Quick Start

Get Stowaway running in minutes with Docker:

```bash
# Clone the repository
git clone https://github.com/rennerdo30/stowaway.git
cd stowaway

# Start with Docker Compose
docker-compose up -d

# Open http://localhost:3000
```

---

## Tech Stack

Stowaway is built with modern, reliable technologies:

| Technology | Purpose |
|------------|---------|
| [Next.js 14+](https://nextjs.org/) | React framework with App Router |
| [Prisma](https://www.prisma.io/) | Type-safe database ORM |
| [SQLite](https://www.sqlite.org/) | Lightweight, embedded database |
| [NextAuth.js v5](https://authjs.dev/) | Authentication & sessions |
| [shadcn/ui](https://ui.shadcn.com/) | Beautiful UI components |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |

---

## What's Next?

Ready to get started? Check out the [Installation Guide](getting-started/installation.md) to set up Stowaway.

<div style="text-align: center; margin-top: 3rem;">

[Get Started :material-arrow-right:](getting-started/installation.md){ .md-button .md-button--primary }

</div>
