import { z } from "zod";
export declare const signupSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const signinSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const contentSchema: z.ZodObject<{
    link: z.ZodURL;
    title: z.ZodString;
    type: z.ZodEnum<{
        twitter: "twitter";
        youtube: "youtube";
        document: "document";
    }>;
}, z.core.$strip>;
export declare const deleteContentSchema: z.ZodObject<{
    contentId: z.ZodString;
}, z.core.$strip>;
export declare const shareSchema: z.ZodObject<{
    share: z.ZodBoolean;
}, z.core.$strip>;
//# sourceMappingURL=validators.d.ts.map