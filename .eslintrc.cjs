module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: false,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'jsx-a11y', 'react-hooks'],
  rules: {
    // Customize or override rules here. For example, you can require
    // explicit return types on functions or disable prop-types if you use
    // TypeScript.
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
