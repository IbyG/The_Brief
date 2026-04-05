import fs from "fs/promises";
import path from "path";
import { AppHeader } from "@/components/AppHeader";
import { TemplatingClient } from "@/app/templating/TemplatingClient";

export const dynamic = "force-dynamic";

export default async function TemplatingPage() {
  const samplePath = path.join(process.cwd(), "src/content/sample-brief.json");
  const initialText = await fs.readFile(samplePath, "utf8");

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      <AppHeader active="templating" />
      <TemplatingClient initialText={initialText} />
    </div>
  );
}
