// Placeholder profile values created with every account; first-time setup must replace both.
export const DEFAULT_PROFILE_NAME = "นักเดินทาง";
export const DEFAULT_PROFILE_USERNAME = "new_hiker";
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export function isProfileSetupComplete(name: string, username: string) {
  const cleanName = name.trim();
  return cleanName !== "" && cleanName !== DEFAULT_PROFILE_NAME && USERNAME_PATTERN.test(username) && username !== DEFAULT_PROFILE_USERNAME;
}
