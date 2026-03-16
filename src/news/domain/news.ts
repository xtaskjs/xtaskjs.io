export type News = {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly summary: string;
  readonly content: string;
  readonly imageUrl: string | null;
  readonly isPublished: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type CreateNewsInput = {
  readonly title: string;
  readonly slug: string;
  readonly summary: string;
  readonly content: string;
  readonly imageUrl: string | null;
  readonly isPublished: boolean;
};

export type UpdateNewsInput = Partial<Omit<CreateNewsInput, "slug">> & {
  readonly slug?: string;
};
