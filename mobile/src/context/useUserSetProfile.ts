import { create } from "zustand";

import type { AvatarName } from "@/constants/avatar-name";
import type { BackgroundColor } from "@/constants/color";

interface SetProfile {
  name: string;
  avatar: AvatarName;
  bg: BackgroundColor;
}

interface UseUserSetProfile {
  data: SetProfile;
  setDataForm: (
    which: "name" | "avatar" | "bg",
    value: string | AvatarName,
  ) => void;
}

export const useUserSetProfile = create<UseUserSetProfile>((set) => ({
  data: {
    name: "",
    avatar: "pixel-dog",
    bg: "#E3E3E3",
  },

  setDataForm: (which, value) => {
    set((state) => ({ data: { ...state.data, [which]: value } }));
  },
}));
