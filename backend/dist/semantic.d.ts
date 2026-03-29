import type { ContentType } from "@prisma/client";
export declare function generateEmbedding(input: string): Promise<number[] | null>;
export declare function deriveTagsForContent(params: {
    userId: string;
    title: string;
    link: string;
    type: ContentType;
}): Promise<{
    tags: string[];
    vector: number[] | null;
}>;
export declare function upsertContentEmbedding(params: {
    contentId: string;
    userId: string;
    title: string;
    link: string;
    type: ContentType;
    tags: string[];
    vector: number[];
}): Promise<void>;
export declare function deleteContentEmbedding(contentId: string): Promise<void>;
//# sourceMappingURL=semantic.d.ts.map