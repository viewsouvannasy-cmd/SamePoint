import { PixelDog } from "./avatar-profile/PixelDog";
import { PixelCat } from "./avatar-profile/PixelCat";
import type { AvatarName } from "@/constants/avatar-name";

interface Avatar {
  avatar: AvatarName;
  size?: number;
}

export function Avatar({ avatar, size }: Avatar) {
  return (
    <>
      {avatar === "pixel-dog" && <PixelDog size={size} />}
      {avatar === "pixel-cat" && <PixelCat size={size} />}
    </>
  );
}
