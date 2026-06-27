import type { CSSProperties, ReactNode } from "react";
import { renderRichText } from "@/lib/rich-text";

type RichTextTag = "span" | "p" | "div" | "h2" | "h3" | "dt" | "dd" | "blockquote";

export function RichText({
  children,
  as: Tag = "span",
  className,
  style,
}: {
  children: string;
  as?: RichTextTag;
  className?: string;
  style?: CSSProperties;
}) {
  const content = renderRichText(children);
  if (!content) {
    return null;
  }
  return (
    <Tag className={className} style={style}>
      {content as ReactNode}
    </Tag>
  );
}

export function RichTextQuote({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const content = renderRichText(children);
  if (!content) {
    return null;
  }
  return (
    <blockquote className={className}>
      <span aria-hidden>&ldquo;</span>
      {content as ReactNode}
      <span aria-hidden>&rdquo;</span>
    </blockquote>
  );
}
