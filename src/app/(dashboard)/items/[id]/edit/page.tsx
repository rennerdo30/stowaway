import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ItemForm } from "@/components/items/item-form";

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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Item</h1>
        <p className="text-muted-foreground">
          Update {item.name}
        </p>
      </div>
      <ItemForm item={item} mode="edit" />
    </div>
  );
}
