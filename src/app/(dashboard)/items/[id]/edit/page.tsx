import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ItemForm } from "@/components/items/item-form";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/layout/page-shell";

interface EditItemPageProps {
  params: Promise<{ id: string }>;
}

async function getItem(id: string, userId: string) {
  const item = await db.item.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      images: true,
    },
  });

  if (!item || item.userId !== userId) {
    return null;
  }

  return item;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const item = await getItem(id, session.user.id);

  if (!item) {
    notFound();
  }

  return (
    <PageShell width="form">
      <PageHeader
        title="Edit item"
        description={item.name}
        leading={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to item"
            asChild
          >
            <Link href={`/items/${item.id}`}>
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        }
      />
      <ItemForm item={item} mode="edit" />
    </PageShell>
  );
}
