// Absolute resolution so CSS `@import "tailwindcss"` works when the tool cwd is the parent repo.
const tailwindcssResolved = require.resolve("tailwindcss", { paths: [__dirname] });

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
    resolveAlias: {
      tailwindcss: tailwindcssResolved,
    },
  },
};

module.exports = nextConfig;
