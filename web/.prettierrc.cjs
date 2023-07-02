module.exports = {
  plugins: [
    require.resolve("@trivago/prettier-plugin-sort-imports"),
    require("prettier-plugin-tailwindcss"),
  ],
  trailingComma: "es5",
  tabWidth: 2,
  semi: false,
  singleQuote: false,
  endOfLine: "auto",
  importOrder: ["<THIRD_PARTY_MODULES>", "^@/(.*)$", "^[./]"],
}
