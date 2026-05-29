import { ValidationService, zodSchema } from "@xtaskjs/validation";
import type { ZodType } from "zod";

const validationService = new ValidationService();

export const validateRequestData = async <T>(schema: ZodType<T>, value: unknown): Promise<T> => {
  return (await validationService.validate(zodSchema<T>(schema), value)) as T;
};
