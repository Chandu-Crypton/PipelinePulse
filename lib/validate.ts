const REPO_PATTERN = /^([A-Za-z0-9_.-]{1,100})\/([A-Za-z0-9_.-]{1,100})$/;

export function parseRepo(input: string | null): { owner: string; repo: string } | null {
  if (!input) return null;
  const match = REPO_PATTERN.exec(input.trim());
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
