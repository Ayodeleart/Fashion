import { cookies } from "next/headers";
import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme-shared";

export { THEME_COOKIE_NAME } from "@/lib/theme-shared";
export type { Theme } from "@/lib/theme-shared";

export async function resolveTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  const value = cookieStore.get(THEME_COOKIE_NAME)?.value;
  return value === "dark" ? "dark" : "light";
}
