// eslint.config.js
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js"],
    ignores: [
      "./lib/fritz_mockserver.js",
      "./lib/mjs_version/fritz_mockserver_wo_class.js",
    ],
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
]);
