## Advanced

These topics are advanced and we don't expect you to solve them all. Look at these tasks as additional points.

### 1. Finding unused exports

Sometimes exports from a file are no longer used and you would like to find those places in code.
That's what `1.Unused-exports.js` does, it goes through `testFiles` folder and finds unused export.

It would be great if you could expand this:

  - Support as many import/export types as you can.
  - Support typescript path alias - global imports, e.g. '../../reducers' -> '@app/reducers.
  - Refactor parts of the current code that you don't like.

Resources that might be useful

  - https://astexplorer.net/
