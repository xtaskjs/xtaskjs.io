import { StringValueObject } from "@xtaskjs/value-objects";

const SECURITY_CODE_PATTERN = /^\d{6}$/;

export class SecurityCode extends StringValueObject {
  constructor(value: string) {
    const normalized = String(value || "").trim();

    if (!SECURITY_CODE_PATTERN.test(normalized)) {
      throw new Error("Security code must be exactly 6 digits");
    }

    super(normalized);
  }
}