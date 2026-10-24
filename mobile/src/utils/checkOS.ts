import { Platform } from "expo";

export function checkOS(os: string): boolean {
  return Platform.OS === os;
}
