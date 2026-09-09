export function pathTo(path = ""): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const clean = path.replace(/^\//, "");
  return normalizedBase + clean;
}

export function repoPath(owner: string, name: string): string {
  return pathTo(`repo/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/`);
}

export function categoryPath(slug: string): string {
  return pathTo(`c/${encodeURIComponent(slug)}/`);
}
