module.exports = {
  useTabs: false,
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.cjs',
  pluginSearchDirs: ['.'],
};
