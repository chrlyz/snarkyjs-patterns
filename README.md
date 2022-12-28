# SnarkyJS Patterns

[zkApp-CLI](https://github.com/o1-labs/zkapp-cli) generated template with a collection of [SnarkyJS](https://github.com/o1-labs/snarkyjs) patterns
to replicate errors, save and share potentially useful code,
or even just document why some things don't work, etc.

To try a pattern just copy the files from a directory
located under `./patterns`, into `./src` (If the directory name ends with `failure`
is because the pattern throws an error when executed. If it ends with `success`
it doesn't throw an error, but doesn't necessarily means it is correct.
Look for comments explaining why.), then:

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
