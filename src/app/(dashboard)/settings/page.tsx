"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Download, Upload, Database, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_THEME, THEME_OPTIONS } from "@/lib/theme";
import { EMPTY_VALUE } from "@/lib/constants";

/** Export formats offered by `/api/export`. */
const EXPORT_FORMATS = [
  { value: "json", label: "Export JSON" },
  { value: "csv", label: "Export CSV" },
] as const;

type ExportFormat = (typeof EXPORT_FORMATS)[number]["value"];

const EXPORT_FILENAME_PREFIX = "inventory-export";
const IMPORT_FILE_INPUT_ID = "import-file";
const IMPORT_ACCEPTED_TYPES = ".json,.csv";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null
  );
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      const response = await fetch(`/api/export?format=${format}`);
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const today = new Date().toISOString().split("T")[0];
      anchor.download = `${EXPORT_FILENAME_PREFIX}-${today}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      toast.success(`Imported ${data.itemsImported} items successfully`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import data"
      );
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const accountFields = [
    { label: "Name", value: session?.user?.name || EMPTY_VALUE },
    { label: "Email", value: session?.user?.email || EMPTY_VALUE },
    {
      label: "Role",
      value: session?.user?.role?.toLowerCase() || EMPTY_VALUE,
      capitalize: true,
    },
  ];

  return (
    <PageShell width="form">
      <PageHeader
        title="Settings"
        description="Manage your application preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" aria-hidden="true" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme-select">Theme</Label>
              <p className="text-muted-foreground text-sm">
                Select your preferred color scheme
              </p>
            </div>
            <Select value={theme ?? DEFAULT_THEME} onValueChange={setTheme}>
              <SelectTrigger id="theme-select" className="w-full sm:w-44">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <option.icon className="size-4" aria-hidden="true" />
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="size-4" aria-hidden="true" />
            Data management
          </CardTitle>
          <CardDescription>
            Export or import your inventory data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Export data</h2>
              <p className="text-muted-foreground text-sm">
                Download all your items, categories and locations as a backup
                file.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXPORT_FORMATS.map((format) => (
                <Button
                  key={format.value}
                  variant="outline"
                  onClick={() => handleExport(format.value)}
                  disabled={exportingFormat !== null}
                >
                  {exportingFormat === format.value ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="size-4" aria-hidden="true" />
                  )}
                  {format.label}
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Import data</h2>
              <p className="text-muted-foreground text-sm">
                Import items from a JSON or CSV file. This adds to your existing
                data.
              </p>
            </div>
            <input
              type="file"
              accept={IMPORT_ACCEPTED_TYPES}
              onChange={handleImport}
              disabled={isImporting}
              className="sr-only"
              id={IMPORT_FILE_INPUT_ID}
            />
            <Button
              variant="outline"
              aria-controls={IMPORT_FILE_INPUT_ID}
              onClick={() =>
                document.getElementById(IMPORT_FILE_INPUT_ID)?.click()
              }
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="size-4" aria-hidden="true" />
              )}
              {isImporting ? "Importing…" : "Choose file"}
            </Button>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            {accountFields.map((field) => (
              <div key={field.label} className="space-y-1">
                <dt className="text-muted-foreground text-sm">{field.label}</dt>
                <dd
                  className={`font-medium break-words ${
                    field.capitalize ? "capitalize" : ""
                  }`}
                >
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </PageShell>
  );
}
