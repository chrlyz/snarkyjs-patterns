# SnarkyJS Patterns

[zkApp-CLI](https://github.com/o1-labs/zkapp-cli) generated template with a collection of [SnarkyJS](https://github.com/o1-labs/snarkyjs) patterns
to replicate errors, save and share potentially useful code,
or even just document why some things don't work, etc.

To test a pattern just copy the files from a directory
located under `./patterns`, into `./src` then:

## Install npm modules:

```sh
npm install
```

## Build pattern:

```sh
npm run build
```
## After building, run pattern:

```sh
node ./build/src/interact.js
```
## Or if the pattern directory has a `*.test.ts` file, run the pattern tests with:

```sh
npm run test -- <name of the .test.ts file>
```