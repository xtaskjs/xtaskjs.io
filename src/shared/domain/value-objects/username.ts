import { StringValueObject } from "@xtaskjs/value-objects";

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/;

const normalizeUsername = (value: string): string => value.trim().toLowerCase();

export class Username extends StringValueObject {
  constructor(value: string) {
    const normalized = normalizeUsername(value);

    if (normalized.length < 3 || normalized.length > 30) {
      throw new Error("Username must be between 3 and 30 characters");
    }

    if (!USERNAME_PATTERN.test(normalized)) {
      throw new Error("Username may only contain lowercase letters, numbers, dots, underscores, and hyphens");
    }

    super(normalized);
  }
}