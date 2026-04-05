export type IngestPhase = "read" | "parse" | "validate";

export interface IngestLogLine {
  level: "info" | "warn" | "error";
  phase: IngestPhase;
  file: string;
  message: string;
}

const buffer: IngestLogLine[] = [];
const MAX = 200;

export function logIngest(entry: IngestLogLine): void {
  buffer.push(entry);
  if (buffer.length > MAX) {
    buffer.splice(0, buffer.length - MAX);
  }
  const prefix = `[brief:${entry.phase}] ${entry.file}`;
  if (entry.level === "error") {
    console.error(prefix, entry.message);
  } else if (entry.level === "warn") {
    console.warn(prefix, entry.message);
  } else {
    console.info(prefix, entry.message);
  }
}

export function peekIngestLogs(): IngestLogLine[] {
  return [...buffer];
}
