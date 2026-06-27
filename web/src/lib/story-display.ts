import type { CSSProperties } from "react";

/** Shared display helpers for story frame items and sections. */

export type SemanticColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export interface DisplayStyle {
  color?: string;
  accent?: string;
  variant?: string;
  highlight?: boolean;
}

export const SEMANTIC_COLOR_OPTIONS = [
  {
    value: "primary",
    label: "Primary",
    description: "Main editorial emphasis.",
    swatch: "#ac2b31",
  },
  {
    value: "secondary",
    label: "Secondary",
    description: "Supporting emphasis and metrics.",
    swatch: "#006a66",
  },
  {
    value: "tertiary",
    label: "Tertiary",
    description: "Alternative positive accent.",
    swatch: "#00694e",
  },
  {
    value: "success",
    label: "Success",
    description: "Positive or on-track status.",
    swatch: "#00694e",
  },
  {
    value: "warning",
    label: "Warning",
    description: "Risk, caution, or needs attention.",
    swatch: "#f1c75b",
  },
  {
    value: "error",
    label: "Error",
    description: "Blocked, failed, urgent, or negative.",
    swatch: "#ba1a1a",
  },
  {
    value: "neutral",
    label: "Neutral",
    description: "Quiet/default card treatment.",
    swatch: "#e8e8e8",
  },
] as const;

const SEMANTIC_VALUE_CLASSES: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  success: "text-tertiary",
  warning: "text-secondary",
  error: "text-error",
  neutral: "text-on-surface",
};

const SEMANTIC_SURFACE_CLASSES: Record<string, string> = {
  primary: "bg-primary/8 border-primary/25",
  secondary: "bg-secondary/8 border-secondary/25",
  tertiary: "bg-tertiary/8 border-tertiary/25",
  success: "bg-tertiary/8 border-tertiary/25",
  warning: "bg-secondary-container/40 border-secondary/20",
  error: "bg-error-container/50 border-error/25",
  neutral: "bg-surface-container-low border-outline-variant/20",
};

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function resolveContexts(item: {
  context?: string | string[];
  contexts?: string[];
}): string[] {
  if (Array.isArray(item.contexts) && item.contexts.length > 0) {
    return item.contexts.filter((c) => typeof c === "string" && c.trim().length > 0);
  }
  if (Array.isArray(item.context)) {
    return item.context.filter((c) => typeof c === "string" && c.trim().length > 0);
  }
  if (typeof item.context === "string" && item.context.trim().length > 0) {
    return [item.context];
  }
  return [];
}

export function formatDisplayValue(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

export function itemSurfaceClass(style?: DisplayStyle): string {
  const base = "rounded-xl border p-4";
  if (!style) {
    return `${base} bg-surface-container-low border-transparent`;
  }
  if (style.highlight) {
    return `${base} ring-2 ring-primary/30 bg-surface-container-lowest`;
  }
  const color = style.color?.toLowerCase();
  if (color && SEMANTIC_SURFACE_CLASSES[color]) {
    return `${base} ${SEMANTIC_SURFACE_CLASSES[color]}`;
  }
  if (color && HEX_COLOR.test(color)) {
    return `${base} bg-surface-container-low border-transparent`;
  }
  if (style.variant === "outline") {
    return `${base} bg-surface-container-lowest border-outline-variant/35`;
  }
  return `${base} bg-surface-container-low border-transparent`;
}

export function itemSurfaceStyle(style?: DisplayStyle): CSSProperties | undefined {
  const color = style?.color;
  if (color && HEX_COLOR.test(color)) {
    return {
      borderColor: `${color}40`,
      backgroundColor: `${color}12`,
    };
  }
  return undefined;
}

export function itemValueClass(style?: DisplayStyle): string {
  const color = style?.color?.toLowerCase();
  if (color && SEMANTIC_VALUE_CLASSES[color]) {
    return SEMANTIC_VALUE_CLASSES[color];
  }
  if (color && HEX_COLOR.test(color)) {
    return "text-on-surface";
  }
  return "text-on-surface";
}

export function itemValueStyle(style?: DisplayStyle): CSSProperties | undefined {
  const color = style?.color;
  if (color && HEX_COLOR.test(color)) {
    return { color };
  }
  return undefined;
}

export function sectionGridClass(columns?: number): string {
  if (!columns || columns <= 1) {
    return "grid gap-4";
  }
  const capped = Math.min(Math.max(columns, 1), 4);
  if (capped === 2) {
    return "grid gap-4 sm:grid-cols-2";
  }
  if (capped === 3) {
    return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  }
  return "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
}
