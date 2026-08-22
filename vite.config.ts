import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import handlebars from "vite-plugin-handlebars";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [
    tailwindcss(),
    handlebars({
      partialDirectory: fromRoot("./partials"),
      compileOptions: {
        preventIndent: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: fromRoot("./index.html"),
        rule: fromRoot("./rule.html"),
        Instructions: fromRoot("./Instructions.html"),
        form: fromRoot("./form.html"),
        line: fromRoot("./line.html"),
        opinion: fromRoot("./opinion.html"),
        "article/article_001": fromRoot("./article/article_001.html"),
        "article/article_002": fromRoot("./article/article_002.html"),
        "article/article_003": fromRoot("./article/article_003.html"),
        "article/article_004": fromRoot("./article/article_004.html"),
        "other/powerpointkaraoke": fromRoot(
          "./other/powerpointkaraoke.html",
        ),
      },
    },
  },
});
