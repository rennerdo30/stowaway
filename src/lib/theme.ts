import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ThemeOption {
  value: "light" | "dark" | "system";
  label: string;
  icon: LucideIcon;
}

/**
 * The selectable color schemes, shared by the header toggle and the settings
 * page so both always offer exactly the same options in the same order.
 */
export const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export const DEFAULT_THEME: ThemeOption["value"] = "system";
