import { ItemForm } from "@/components/items/item-form";

export default function NewItemPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Item</h1>
        <p className="text-muted-foreground">
          Add a new item to your inventory
        </p>
      </div>
      <ItemForm mode="create" />
    </div>
  );
}
