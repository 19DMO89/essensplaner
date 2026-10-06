// Baut Panel und Karte in je eine Datei unter custom_components/essensplaner/frontend/.
import * as esbuild from "esbuild";

const options = {
  entryPoints: {
    "essensplaner-panel": "src/panel.js",
    "essensplaner-card": "src/card.js",
  },
  outdir: "../custom_components/essensplaner/frontend",
  bundle: true,
  format: "esm",
  target: "es2021",
  minify: true,
  legalComments: "none",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
