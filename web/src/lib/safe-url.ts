/** Allow only http(s) links in rendered JSON to reduce XSS / javascript: vectors. */
export function safeHttpUrl(href: string): string {
  try {
    const u = new URL(href);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return u.href;
    }
  } catch {
    /* ignore */
  }
  return "";
}
