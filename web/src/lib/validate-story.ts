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

export function validateStoryJson(data: unknown): ValidationResult {
  const validate = getValidate();
  if (validate(data)) {
    return { ok: true, data: data as StoryFrame };
  }
  return { ok: false, errors: validate.errors };
}

export function formatAjvErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors?.length) {
    return ["Validation failed."];
  }
  return errors.map((e) => {
    const path = e.instancePath || "(root)";
    return `${path}: ${e.message ?? "invalid"}`.trim();
  });
}
