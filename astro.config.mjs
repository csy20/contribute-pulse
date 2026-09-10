import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function copyBoardData() {
  return {
    name: "copy-board-data",
    hooks: {
      "astro:config:setup": () => {
        const destDir = resolve(root, "public/data");
        mkdirSync(destDir, { recursive: true });
        for (const file of ["latest.json", "categories.json", "meta.json"]) {
          const src = resolve(root, "data", file);
          if (existsSync(src)) copyFileSync(src, resolve(destDir, file));
        }
      },
    },
  };
}

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const isUserSite = repoName && owner && repoName === `${owner}.github.io`;
const onVercel = Boolean(process.env.VERCEL);
const base =
  process.env.BASE_PATH ||
  (process.env.GITHUB_ACTIONS && !onVercel && repoName && !isUserSite ? `/${repoName}/` : "/");

const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://csy20.me");

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "always",
  integrations: [copyBoardData(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
