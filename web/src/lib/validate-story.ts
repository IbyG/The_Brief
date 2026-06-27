import Ajv2020, {
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020";
import addFormats from "ajv-formats";
import storyFrameSchema from "@/lib/story-frame.schema.json";
import type { StoryFrame } from "@/types/story-frame";

let validateFn: ValidateFunction | null = null;

function getValidate(): ValidateFunction {
  if (!validateFn) {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    validateFn = ajv.compile(storyFrameSchema);
  }
  return validateFn;
}

export interface ValidationFailure {
  ok: false;
  errors: ErrorObject[] | null | undefined;
}

export interface ValidationSuccess {
  ok: true;
  data: StoryFrame;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export interface FormattedValidationIssue {
  path: string;
  message: string;
  fix?: string;
}

const FIELD_LABELS: Record<string, string> = {
  rank: "Rank",
  headline: "Headline",
  date_confirmed: "Confirmed date",
  sources_confirmed: "Confirmed sources",
  summary: "Summary",
  sections: "Sections",
  meta: "Metadata",
  id: "Section id",
  type: "Section type",
  title: "Title",
  items: "Items",
  label: "Label",
  value: "Value",
  context: "Context",
  contexts: "Contexts",
  text: "Text",
  quote: "Quote",
  url: "URL",
  kind: "Block kind",
};

const SECTION_TYPES = [
  "bullet_list",
  "cards",
  "links",
  "timeline",
  "quotes",
  "stats",
  "generic",
] as const;

function labelForPath(path: string): string {
  const segment = path.split("/").filter(Boolean).pop() ?? path;
  return FIELD_LABELS[segment] ?? segment;
}

function sectionTypeHint(data: unknown, sectionIndex: number): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const sections = (data as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) {
    return null;
  }
  const section = sections[sectionIndex];
  if (!section || typeof section !== "object") {
    return null;
  }
  const type = (section as { type?: unknown }).type;
  return typeof type === "string" ? type : null;
}

function humanizeOneOfError(
  error: ErrorObject,
  data: unknown,
): FormattedValidationIssue | null {
  if (error.keyword !== "oneOf") {
    return null;
  }
  const match = error.instancePath.match(/^\/sections\/(\d+)/);
  if (!match) {
    return null;
  }
  const index = Number(match[1]);
  const type = sectionTypeHint(data, index);
  const path = error.instancePath || "(root)";
  if (type) {
    return {
      path,
      message: `Section ${index + 1} (${type}) has items that do not match the "${type}" shape.`,
      fix: `Open sections[${index}] and check each item has the required fields for type "${type}". See an example via Select Block or load a template.`,
    };
  }
  return {
    path,
    message: `Section ${index + 1} does not match any known section type.`,
    fix: `Set "type" to one of: ${SECTION_TYPES.join(", ")}.`,
  };
}

function humanizeError(error: ErrorObject, data: unknown): FormattedValidationIssue {
  const oneOf = humanizeOneOfError(error, data);
  if (oneOf) {
    return oneOf;
  }

  const path = error.instancePath || "(root)";
  const field = labelForPath(path);
  const params = error.params as Record<string, unknown>;

  switch (error.keyword) {
    case "required": {
      const missing = String(params.missingProperty ?? "field");
      const missingLabel = FIELD_LABELS[missing] ?? missing;
      return {
        path,
        message: `${field}: missing required property "${missingLabel}".`,
        fix: `Add "${missing}" to this object.`,
      };
    }
    case "format": {
      if (params.format === "date") {
        return {
          path,
          message: `${field}: invalid date value.`,
          fix: "Provide a date string in whatever format you prefer (e.g. 05-04-2026 or 2026-04-05).",
        };
      }
      if (params.format === "uri") {
        return {
          path,
          message: `${field}: must be a full URL starting with http:// or https://.`,
          fix: 'Example: "https://example.com/page".',
        };
      }
      return {
        path,
        message: `${field}: invalid format (${String(params.format)}).`,
        fix: "Check the value matches the expected format for this field.",
      };
    }
    case "type": {
      const expected = Array.isArray(params.type)
        ? (params.type as string[]).join(" or ")
        : String(params.type);
      return {
        path,
        message: `${field}: expected ${expected}.`,
        fix: `Change this value to ${expected}.`,
      };
    }
    case "enum":
    case "const": {
      const allowed = params.allowedValues ?? params.allowedValue;
      const list = Array.isArray(allowed)
        ? allowed.map(String).join(", ")
        : String(allowed);
      return {
        path,
        message: `${field}: invalid value.`,
        fix: `Use one of: ${list}.`,
      };
    }
    case "pattern": {
      if (path.endsWith("/id")) {
        return {
          path,
          message: `${field}: use lowercase letters, numbers, and hyphens only.`,
          fix: 'Example: "scoreboard" or "work-stream-1".',
        };
      }
      return {
        path,
        message: `${field}: value does not match the required pattern.`,
        fix: `Pattern: ${String(params.pattern)}.`,
      };
    }
    case "minLength":
      return {
        path,
        message: `${field}: cannot be empty.`,
        fix: "Provide a non-empty string.",
      };
    case "minimum":
      return {
        path,
        message: `${field}: must be at least ${String(params.limit)}.`,
        fix: `Use a number ≥ ${String(params.limit)}.`,
      };
    case "additionalProperties":
      return {
        path,
        message: `${field}: unknown property "${String(params.additionalProperty)}".`,
        fix: "Remove the property or check spelling. Custom fields are allowed on items and meta.",
      };
    default:
      return {
        path,
        message: `${field}: ${error.message ?? "invalid"}.`,
        fix: "Compare this field with a working template example.",
      };
  }
}

export function formatAjvErrors(
  errors: ErrorObject[] | null | undefined,
  data?: unknown,
): string[] {
  if (!errors?.length) {
    return ["Validation failed."];
  }
  return formatValidationIssues(errors, data).map((issue) => {
    if (issue.fix) {
      return `${issue.path}: ${issue.message} — ${issue.fix}`;
    }
    return `${issue.path}: ${issue.message}`;
  });
}

export function formatValidationIssues(
  errors: ErrorObject[] | null | undefined,
  data?: unknown,
): FormattedValidationIssue[] {
  if (!errors?.length) {
    return [{ path: "(root)", message: "Validation failed." }];
  }

  const seen = new Set<string>();
  const issues: FormattedValidationIssue[] = [];
  const sectionPathsWithHint = new Set<string>();

  for (const error of errors) {
    const oneOf = humanizeOneOfError(error, data);
    if (oneOf && error.instancePath.match(/^\/sections\/\d+$/)) {
      sectionPathsWithHint.add(error.instancePath);
    }
  }

  for (const error of errors) {
    if (error.keyword === "oneOf" && error.instancePath.match(/^\/sections\/\d+$/)) {
      const hint = humanizeOneOfError(error, data);
      if (hint) {
        const key = `${hint.path}|${hint.message}|${hint.fix ?? ""}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push(hint);
        }
      }
      continue;
    }

    if (error.keyword === "oneOf") {
      continue;
    }

    if (error.keyword === "maxLength" && errors.some(
      (e) => e.instancePath === error.instancePath && e.keyword === "format",
    )) {
      continue;
    }

    const path = error.instancePath || "(root)";
    const sectionMatch = path.match(/^(\/sections\/\d+)/);
    if (sectionMatch && sectionPathsWithHint.has(sectionMatch[1])) {
      if (error.keyword === "const" && path.endsWith("/type")) {
        continue;
      }
      if (error.keyword === "required" && path.includes("/items/")) {
        continue;
      }
    }

    const issue = humanizeError(error, data);
    const key = `${issue.path}|${issue.message}|${issue.fix ?? ""}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    issues.push(issue);
  }

  return issues.length > 0 ? issues : [{ path: "(root)", message: "Validation failed." }];
}

function omitEmptyString(value: unknown): unknown {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}

/**
 * Normalizes common author mistakes so preview can render while drafting.
 * Returns warnings describing what was adjusted.
 */
export function coerceStoryFrameForPreview(data: unknown): {
  data: unknown;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (!data || typeof data !== "object") {
    return { data, warnings };
  }

  const root = { ...(data as Record<string, unknown>) };

  if (root.date_confirmed === "") {
    delete root.date_confirmed;
    warnings.push(
      "date_confirmed was empty — omitted for preview. Use any date format you prefer or leave the field out.",
    );
  }

  if (root.rank === "" || root.rank === null) {
    delete root.rank;
    warnings.push(
      "rank was empty — omitted for preview. Use a positive integer (1, 2, 3…) or remove the field.",
    );
  }

  if (Array.isArray(root.sections)) {
    root.sections = root.sections.map((section, sectionIndex) => {
      if (!section || typeof section !== "object") {
        return section;
      }
      const s = { ...(section as Record<string, unknown>) };
      if (Array.isArray(s.items)) {
        s.items = s.items.map((item, itemIndex) => {
          if (!item || typeof item !== "object") {
            return item;
          }
          const next = { ...(item as Record<string, unknown>) };
          for (const key of ["context", "note", "description", "speaker", "role", "source", "category"]) {
            const cleaned = omitEmptyString(next[key]);
            if (cleaned === undefined && next[key] === "") {
              delete next[key];
              warnings.push(
                `sections[${sectionIndex}].items[${itemIndex}].${key} was empty — omitted for preview.`,
              );
            }
          }
          return next;
        });
      }
      return s;
    });
  }

  return { data: root, warnings };
}

function normalizeStoryFrame(data: StoryFrame): StoryFrame {
  const rank = (data as { rank?: unknown }).rank;
  if (rank === null || rank === "" || rank === undefined) {
    const { rank: _removed, ...rest } = data as StoryFrame & { rank?: unknown };
    return rest as StoryFrame;
  }
  return data;
}

export function validateStoryJson(data: unknown): ValidationResult {
  const validate = getValidate();
  if (validate(data)) {
    return { ok: true, data: normalizeStoryFrame(data as StoryFrame) };
  }
  return { ok: false, errors: validate.errors };
}

export interface PreviewValidationResult {
  ok: boolean;
  data: StoryFrame | null;
  errors: FormattedValidationIssue[];
  warnings: string[];
}

export function validateStoryJsonForPreview(rawData: unknown): PreviewValidationResult {
  const { data, warnings } = coerceStoryFrameForPreview(rawData);
  const validated = validateStoryJson(data);

  if (validated.ok) {
    return {
      ok: true,
      data: validated.data,
      errors: [],
      warnings,
    };
  }

  return {
    ok: false,
    data: null,
    errors: formatValidationIssues(validated.errors, data),
    warnings,
  };
}
