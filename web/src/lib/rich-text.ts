import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import { SEMANTIC_COLOR_OPTIONS } from "@/lib/story-display";

export type RichTextNode =
  | { type: "text"; value: string }
  | { type: "bold"; children: RichTextNode[] }
  | { type: "italic"; children: RichTextNode[] }
  | { type: "underline"; children: RichTextNode[] }
  | { type: "color"; color: string; children: RichTextNode[] };

const SEMANTIC_COLORS = new Set<string>(SEMANTIC_COLOR_OPTIONS.map((option) => option.value));
const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const TAG_TO_MARK: Record<string, RichTextNode["type"]> = {
  b: "bold",
  strong: "bold",
  i: "italic",
  em: "italic",
  u: "underline",
};

function isSemanticColor(value: string): boolean {
  return SEMANTIC_COLORS.has(value.toLowerCase());
}

function parseSpanColor(attrs: string): string | null {
  const dataColor = attrs.match(/\bdata-color=["']([^"']+)["']/i)?.[1];
  if (dataColor && (isSemanticColor(dataColor) || HEX_COLOR.test(dataColor))) {
    return dataColor.toLowerCase();
  }

  const className = attrs.match(/\bclass=["']([^"']+)["']/i)?.[1];
  if (className) {
    for (const token of className.split(/\s+/)) {
      if (token.startsWith("text-")) {
        const semantic = token.slice("text-".length);
        if (isSemanticColor(semantic)) {
          return semantic;
        }
      }
    }
  }

  const style = attrs.match(/\bstyle=["']([^"']+)["']/i)?.[1];
  if (style) {
    const color = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1]?.trim();
    if (color && (isSemanticColor(color) || HEX_COLOR.test(color))) {
      return color.toLowerCase();
    }
  }

  return null;
}

function parseMarkdownNodes(input: string): RichTextNode[] {
  const nodes: RichTextNode[] = [];
  let index = 0;

  while (index < input.length) {
    const rest = input.slice(index);
    const bold = rest.match(/^\*\*([\s\S]+?)\*\*/);
    const underline = rest.match(/^__([\s\S]+?)__/);
    const italic = rest.match(/^\*([^*]+?)\*|^_([^_]+?)_/);

    if (bold) {
      nodes.push({ type: "bold", children: parseMarkdownNodes(bold[1]) });
      index += bold[0].length;
      continue;
    }

    if (underline) {
      nodes.push({ type: "underline", children: parseMarkdownNodes(underline[1]) });
      index += underline[0].length;
      continue;
    }

    if (italic) {
      const inner = italic[1] ?? italic[2] ?? "";
      nodes.push({ type: "italic", children: parseMarkdownNodes(inner) });
      index += italic[0].length;
      continue;
    }

    const nextSpecial = rest.search(/\*\*|__|\*|_/);
    if (nextSpecial === -1) {
      nodes.push({ type: "text", value: rest });
      break;
    }
    if (nextSpecial > 0) {
      nodes.push({ type: "text", value: rest.slice(0, nextSpecial) });
      index += nextSpecial;
      continue;
    }

    nodes.push({ type: "text", value: rest[0] });
    index += 1;
  }

  return nodes;
}

function parseBracketColor(input: string, index: number): { node: RichTextNode; next: number } | null {
  const rest = input.slice(index);
  const open = rest.match(/^\[(#[0-9a-fA-F]{3,8}|[a-z]+)\]/);
  if (!open) {
    return null;
  }

  const color = open[1].toLowerCase();
  if (!isSemanticColor(color) && !HEX_COLOR.test(color)) {
    return null;
  }

  const contentStart = index + open[0].length;
  const closePattern = new RegExp(`\\[\\/${color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]`, "i");
  const closeMatch = input.slice(contentStart).match(closePattern);
  if (!closeMatch || closeMatch.index === undefined) {
    return null;
  }

  const inner = input.slice(contentStart, contentStart + closeMatch.index);
  const next = contentStart + closeMatch.index + closeMatch[0].length;
  return {
    node: {
      type: "color",
      color,
      children: parseRichText(inner),
    },
    next,
  };
}

function parseMarkup(input: string, index: number): { nodes: RichTextNode[]; next: number } {
  const nodes: RichTextNode[] = [];

  while (index < input.length) {
    const rest = input.slice(index);

    const bracket = parseBracketColor(input, index);
    if (bracket) {
      nodes.push(bracket.node);
      index = bracket.next;
      continue;
    }

    const tagOpen = rest.match(/^<([a-z]+)([^>]*)>/i);
    if (tagOpen) {
      const tag = tagOpen[1].toLowerCase();
      const attrs = tagOpen[2];
      const openLen = tagOpen[0].length;

      if (tag === "br") {
        nodes.push({ type: "text", value: "\n" });
        index += openLen;
        continue;
      }

      if (tag in TAG_TO_MARK || tag === "span") {
        const close = new RegExp(`<\\/${tag}>`, "i");
        const afterOpen = input.slice(index + openLen);
        const closeMatch = afterOpen.match(close);
        if (closeMatch && closeMatch.index !== undefined) {
          const inner = afterOpen.slice(0, closeMatch.index);
          const innerNodes = parseMarkup(inner, 0).nodes;
          const mark = TAG_TO_MARK[tag];
          if (mark === "bold" || mark === "italic" || mark === "underline") {
            nodes.push({
              type: mark,
              children: innerNodes.length ? innerNodes : [{ type: "text", value: "" }],
            });
          } else {
            const spanColor = parseSpanColor(attrs);
            if (spanColor) {
              nodes.push({
                type: "color",
                color: spanColor,
                children: innerNodes.length ? innerNodes : [{ type: "text", value: "" }],
              });
            } else {
              nodes.push(...innerNodes);
            }
          }
          index += openLen + closeMatch.index + closeMatch[0].length;
          continue;
        }
      }
    }

    const tagClose = rest.match(/^<\/[a-z]+>/i);
    if (tagClose) {
      break;
    }

    const nextTag = rest.search(/<\/[a-z]+>|<[a-z]+[^>]*>|\[(?:#[0-9a-fA-F]{3,8}|[a-z]+)\]/i);
    if (nextTag === -1) {
      nodes.push(...parseMarkdownNodes(rest));
      index = input.length;
      break;
    }
    if (nextTag > 0) {
      nodes.push(...parseMarkdownNodes(rest.slice(0, nextTag)));
      index += nextTag;
      continue;
    }

    nodes.push({ type: "text", value: rest[0] });
    index += 1;
  }

  return { nodes, next: index };
}

/** Parse inline rich text markup into a safe AST. */
export function parseRichText(input: string): RichTextNode[] {
  if (!input) {
    return [];
  }
  return parseMarkup(input, 0).nodes;
}

function semanticTextClass(color: string): string | undefined {
  const map: Record<string, string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
    success: "text-tertiary",
    warning: "text-secondary",
    error: "text-error",
    neutral: "text-on-surface-variant",
  };
  return map[color];
}

function renderRichTextNodes(nodes: RichTextNode[], keyPrefix = "rt"): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "text") {
      return node.value ? createElement(Fragment, { key }, node.value) : null;
    }
    if (node.type === "bold") {
      return createElement("strong", { key, className: "font-bold" }, renderRichTextNodes(node.children, key));
    }
    if (node.type === "italic") {
      return createElement("em", { key, className: "italic" }, renderRichTextNodes(node.children, key));
    }
    if (node.type === "underline") {
      return createElement("u", { key, className: "underline underline-offset-2" }, renderRichTextNodes(node.children, key));
    }
    const semanticClass = semanticTextClass(node.color);
    if (semanticClass) {
      return createElement("span", { key, className: semanticClass }, renderRichTextNodes(node.children, key));
    }
    if (HEX_COLOR.test(node.color)) {
      return createElement(
        "span",
        { key, style: { color: node.color } },
        renderRichTextNodes(node.children, key),
      );
    }
    return createElement(Fragment, { key }, renderRichTextNodes(node.children, key));
  });
}

/** Render parsed rich text nodes as safe React elements (no raw HTML injection). */
export function renderRichText(input: string): ReactNode {
  const nodes = parseRichText(input);
  if (nodes.length === 0) {
    return null;
  }
  return createElement(Fragment, null, ...renderRichTextNodes(nodes));
}

export const RICH_TEXT_HELP = [
  "HTML: <b>bold</b>, <i>italic</i>, <u>underline</u>",
  'Color: <span data-color="warning">text</span> or [warning]text[/warning]',
  "Markdown: **bold**, *italic*, __underline__",
  'Hex color: <span style="color: #ac2b31">text</span> or [#ac2b31]text[/#ac2b31]',
] as const;
