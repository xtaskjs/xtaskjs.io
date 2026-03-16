import { Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { createMulterUpload } from "./multer.factory";
import { AppConfig } from "../config/app-config";

@Service()
export class UploadsService {
  private upload = createMulterUpload(AppConfig.paths.uploads);

  async handleNewsImageUpload(req: Request, res: Response): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.upload.single("image")(req, res, (error: unknown) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  toImageUrl(file: Express.Multer.File | undefined): string | null {
    return file ? `/uploads/${file.filename}` : null;
  }

  toOptionalImageUrl(file: Express.Multer.File | undefined): string | undefined {
    return file ? `/uploads/${file.filename}` : undefined;
  }
}