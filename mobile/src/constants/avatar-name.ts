export const AVATAR_NAME = ["pixel-dog", "pixel-cat"] as const;

export type AvatarName = (typeof AVATAR_NAME)[number];
