module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    ".",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    'plugin:prettier/recommended'
  ],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2018,
    project: "tsconfig.json",
    sourceType: "module",
  },
  rules: {
		"prettier/prettier": ["error", {
			"semi": true,
			"trailingComma": 'all',
			"singleQuote": true,
			"printWidth": 160,
			"tabWidth": 4,
			"endOfLine": "auto"
		}],
		"camelcase": 0,
		"@typescript-eslint/no-unused-vars": "error",
		"@typescript-eslint/no-useless-constructor": "error",
		"@typescript-eslint/camelcase": "off",
		"@typescript-eslint/no-unsafe-call": "off",
		"@typescript-eslint/no-unsafe-return": "off",
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/restrict-template-expressions": "off",
		"@typescript-eslint/no-unsafe-member-access": "off",
		"@typescript-eslint/require-await": "off",
		"@typescript-eslint/no-use-before-define": ["error", "nofunc"]
  },
};
