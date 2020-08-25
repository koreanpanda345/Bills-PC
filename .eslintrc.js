module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2020: true,
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: 12,
	},
	rules: {
		indent: [ "error", "tab" ],
		"linebreak-style": [ "error", "windows" ],
		quotes: [ "error", "double" ],
		semi: [ "error", "always" ],
		camelcase: [ "error", { "properties": "always" } ],
		"brace-style": [ "error", "allman", { "allowSingleLine": true } ],
		"block-spacing": [ "error", "always" ],
		"array-bracket-newline": [ "error", "consistent" ],
		"array-bracket-spacing": [ "error", "always" ],
	},
};
