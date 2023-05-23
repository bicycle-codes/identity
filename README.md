# template ts ![tests](https://github.com/nichoth/template-ts/actions/workflows/nodejs.yml/badge.svg)

A template for typescript *dependency* modules that run in node. See [template-ts-browser](https://github.com/nichoth/template-ts-browser) for the same thing but targeting a browser environment.

## use

1. Use the template button in github. Or clone this then `rm -rf .git && git init`.
2. `npm i && npm init`.
3. Edit `README.md`
4. Edit the source code in `src/index.ts`, edit tests in `test`

## featuring

* compile the source to both ESM and CJS format, and put compiled files in `dist`.
* ignore `dist` and `*.js` in git, but don't ignore them in npm. That way we don't commit any compiled code to git, but it is available to consumers.
* use npm's `prepublishOnly` hook to compile the code before publishing to npm.
* use `exports` field in `package.json` to make sure the right format is used by consumers.
* `preversion` npm hook -- lint via `standardx`.
* `postversion` npm hook -- `git push && git push --tags && npm publish`
* eslint via [standardx](https://www.npmjs.com/package/standardx) -- `npm run lint`
* compile tests and run in a node environment
* CI via github actions
