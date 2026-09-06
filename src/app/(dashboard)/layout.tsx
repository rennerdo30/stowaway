import { Sidebar } from "@/components/layout/sidebar";

const MAIN_CONTENT_ID = "main-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="bg-primary text-primary-foreground focus:ring-ring/50 sr-only rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:ring-[3px]"
      >
        Skip to main content
      </a>
      <Sidebar />
      <main id={MAIN_CONTENT_ID} className="pt-header lg:pt-0 lg:pl-sidebar">
        {children}
      </main>
    </div>
  );
}
