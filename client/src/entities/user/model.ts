import type { User } from "./types";

export const getUserDisplayName = (user: Pick<User, "firstName" | "lastName" | "username">) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Unknown";
