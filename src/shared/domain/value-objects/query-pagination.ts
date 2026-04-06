import { NumberValueObject } from "@xtaskjs/value-objects";

export class QueryPageNumber extends NumberValueObject {
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error("Page number must be a positive integer");
    }

    super(value);
  }
}

export class QueryPageSize extends NumberValueObject {
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new Error("Page size must be an integer between 1 and 100");
    }

    super(value);
  }
}