/*
  Supported imports and exports
    import { compose } from 'redux';
    import * as React from 'react';
    import Default, { compose } from 'redux';
    import app from ‘./app’;

    export default
    export const name
    export function name
    export enum
    export interface
    export type

  Not supported:

    import {
      compose,
      path
    } from 'redux';

    module.exports = {}
    export * from ''
    export { something }  from ''
    export {something as something}  from ''

 */

const fs = require('fs');
const resolve = require('resolve');
const path = require('path');
const R = require('ramda');

// resolve into /Users/name/Repositories/sunday-copy/app/index.js -> remove __dirname , you are left with /app/index.js -> add "."
const findPath = path =>
  '.' + R.last(resolve.sync(path, { extensions: ['.js', '.ts', '.jsx', '.tsx'] }).split(__dirname));

const entries = ['./testFiles/app', './testFiles/server'];

// const files = {
//   '...sunday-web-main/app/index.tsx': {
//     path: '...sunday-web-main/app/index.tsx',
//     imports: {
//       './app/components/app.tsx': {
//         usedValues: [],
//       },
//     },
//     exports: {
//       abcd: {
//         type: 'default' | "const" | "function" | "enum" | "interface" | "type" | "re-export"
//         usedBy: ['./app/something.tsx'],
//       },
//     },
//   },
// };
const files = {};

/**
 * Parser opens a file as text, splits into lines, parses the exports, looks for imports, recursively parses every file imported.
 *
 * File tree is parsed depth first.
 *
 * @param pathToFile - path to the current file being parsed
 * @param usedExports - exports imported by the previously parsed file
 * @param previousFiles - all previously parsed file names (used for circular dependency detection)
 * @returns {Promise<void>}
 */
async function parseTree(pathToFile, usedExports = [], previousFiles = []) {
  const parentName = R.last(previousFiles);

  // The file was already parsed before.
  if (files[pathToFile]) {
    // The file exists, check for circular dependency.
    if (previousFiles.includes(pathToFile)) {
      console.log('Circular Dependency', previousFiles, pathToFile);
    } else {
      usedExports.forEach(exportName => {
        if (files[pathToFile].exports[exportName]) {
          files[pathToFile].exports[exportName].usedBy.push(parentName);
        } else {
          console.log(
            'EXPORT REQUESTED BUT NOT FOUND',
            pathToFile,
            exportName,
            R.last(previousFiles),
          );
        }
      });
    }
    return;
  }

  const file = fs.readFileSync(pathToFile, { encoding: 'utf8' });
  const lines = file.split(/\r?\n/);

  files[pathToFile] = {
    path: pathToFile,
    imports: {},
    exports: {},
  };

  // parse exports for the first time
  const exports = lines.filter(str => str.trim().startsWith('export'));

  exports.forEach(exportLine => {
    const exportTokens = exportLine.split(' ');
    if (exportTokens[1] === 'function') {
      // drop ()
      const name = exportTokens[2].split('(')[0];
      files[pathToFile].exports[name] = {
        type: exportTokens[1],
        usedBy: [],
      };
      return;
    }
    if (exportTokens[1] === 'default') {
      files[pathToFile].exports.default = {
        type: 'default',
        usedBy: [],
      };
      return;
    }
    files[pathToFile].exports[exportTokens[2]] = {
      type: exportTokens[1],
      usedBy: [],
    };
  });

  usedExports.forEach(exportName => {
    files[pathToFile].exports[exportName].usedBy.push(parentName);
  });

  const imports = lines.filter(str => str.trim().startsWith('import'));

  imports.forEach(importLine => {
    const tokens = importLine.split(' ');
    let importFileName = R.last(tokens)
      .split(`'`)
      .find(str => str.length > 3); // hack to ignore all random spaces and ;
    let notNodeModule = true;
    // TODO support global imports from tsconfig.json paths e.g. @app/index.ts
    // fix relative paths
    if (importFileName.startsWith('.')) {
      importFileName = findPath('./' + path.join(path.dirname(pathToFile), importFileName));
    } else {
      // found a node_module among us
      notNodeModule = false;
    }

    if (tokens[1] === '*') {
      const originalName = 'default';
      files[pathToFile].imports[importFileName] = {
        usedValues: [originalName],
      };
      // TODO importing with "*" does not check what's actually used in file, assumes everything
      if (notNodeModule) {
        parseTree(importFileName, [], previousFiles.concat(pathToFile));
      }
      return;
    }
    if (tokens[1] === '{') {
      // find the internal string
      const insideTokens = importLine
        .split('{')[1]
        .split('}')[0]
        .split(',')
        .map(a => a.trim());
      const originalNames = insideTokens.map(token => {
        const lookForAs = token.split(' as ');
        return lookForAs[0];
      });
      files[pathToFile].imports[importFileName] = {
        usedValues: originalNames,
      };
      if (notNodeModule) {
        parseTree(importFileName, originalNames, previousFiles.concat(pathToFile));
      }
      return;
    }
    // import Default, { compose } from 'redux';
    if (tokens[1].endsWith(',')) {
      const insideTokens = importLine
        .split('{')[1]
        .split('}')[0]
        .split(',')
        .map(a => a.trim());
      const originalNames = insideTokens.map(token => {
        const lookForAs = token.split(' as ');
        return lookForAs[0];
      });
      originalNames.push('default');
      files[pathToFile].imports[importFileName] = {
        usedValues: originalNames,
      };
      if (notNodeModule) {
        parseTree(importFileName, originalNames, previousFiles.concat(pathToFile));
      }
      return;
    }
    // else its a default name
    files[pathToFile].imports[importFileName] = {
      usedValues: ['default'],
    };
    if (notNodeModule) {
      parseTree(importFileName, ['default'], previousFiles.concat(pathToFile));
    }
  });
}

entries.forEach(entry => {
  parseTree(findPath(entry));
});

const fileNames = Object.keys(files);

const unused = fileNames.map(name => {
  let exportNames = Object.keys(files[name].exports).filter(key => key !== '*');
  return exportNames.filter(exp => files[name].exports[exp].usedBy.length === 0);
});

const unusedMap = unused.reduce((acc, val, i) => {
  if (val.length) {
    acc[fileNames[i]] = val;
  }
  return acc;
}, {});


console.log('Result: \n', unusedMap);
