import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeGalaxy from "starlight-theme-galaxy";
import mermaid from "astro-mermaid";

export default defineConfig({
  // site and base are set via CLI args in CI (from actions/configure-pages)
  integrations: [
    // Must be listed before starlight: astro-mermaid registers the remark
    // plugin that has to see ```mermaid fences before Starlight processes
    // the markdown.
    mermaid({
      // Follows Starlight's light/dark toggle via the data-theme attribute.
      autoTheme: true,
    }),
    starlight({
      title: "Stowaway",
      description: "Modern inventory management system - stow away your items safely",
      logo: { src: "./public/logo.svg", alt: "Stowaway" },
      favicon: "/logo.svg",
      plugins: [starlightThemeGalaxy()],
      customCss: ["./src/styles/custom.css"],
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/rennerdo30/stowaway" },
      ],
      sidebar: [
        { label: "Home", slug: "index" },
        {
          label: "Getting Started",
          items: [
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Quick Start", slug: "getting-started/quickstart" },
            { label: "Configuration", slug: "getting-started/configuration" },
          ],
        },
        {
          label: "Guide",
          items: [
            { label: "Overview", slug: "guide/overview" },
            { label: "Features", slug: "guide/features" },
            { label: "Managing Items", slug: "guide/items" },
          ],
        },
        {
          label: "API Reference",
          items: [
            { label: "Introduction", slug: "api" },
            { label: "Authentication", slug: "api/authentication" },
            { label: "Items", slug: "api/items" },
            { label: "Categories", slug: "api/categories" },
            { label: "Locations", slug: "api/locations" },
          ],
        },
        {
          label: "About",
          items: [
            { label: "Changelog", slug: "about/changelog" },
            { label: "Contributing", slug: "about/contributing" },
            { label: "License", slug: "about/license" },
          ],
        },
      ],
    }),
  ],
});
