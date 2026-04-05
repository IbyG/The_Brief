import type { IngestError } from "@/lib/brief-data";

/**
 * Short human-readable reason for UI: `"x.json" could not be rendered due to "Y"`.
 */
export function userFacingRenderReason(error: IngestError): string {
  switch (error.phase) {
    case "read":
      return `Could not read file: ${error.message}`;
    case "parse":
      return `Invalid JSON: ${error.message}`;
    case "validate":
      return error.message;
    default:
      return error.message;
  }
}
