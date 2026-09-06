import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ItemForm } from "@/components/items/item-form";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Add item",
};

export default function NewItemPage() {
  return (
    <PageShell width="form">
      <PageHeader
        title="Add new item"
        description="Add a new item to your inventory"
        leading={
          <Button variant="ghost" size="icon" aria-label="Back to items" asChild>
            <Link href="/items">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <ItemForm mode="create" />
    </PageShell>
  );
}
