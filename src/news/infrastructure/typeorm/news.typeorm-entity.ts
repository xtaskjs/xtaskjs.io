import { EntitySchema } from "typeorm";
import type { News } from "../../domain/news";

export const NewsTypeOrmEntity = new EntitySchema<News>({
  name: "News",
  tableName: "news",
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String, length: 180 },
    slug: { type: String, unique: true, length: 200 },
    summary: { type: "text" },
    content: { type: "text" },
    imageUrl: { type: String, name: "image_url", length: 500, nullable: true },
    isPublished: { type: Boolean, name: "is_published", default: true },
    createdAt: { type: Date, name: "created_at", createDate: true },
    updatedAt: { type: Date, name: "updated_at", updateDate: true },
  },
});
