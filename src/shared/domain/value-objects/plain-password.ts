import { StringValueObject } from "@xtaskjs/value-objects";

export class PlainPassword extends StringValueObject {
  constructor(value: string) {
    const normalized = String(value || "");

    if (normalized.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    super(normalized);
  }
}