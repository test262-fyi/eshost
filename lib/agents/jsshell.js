'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorRe = /^(.*?)?:(\d+):(\d+)? ([\w\d]+): (.+)?$/m;
const customErrorRe = /uncaught exception:\s([\w\d]+): (.+)?$/m;

const stackRe = /^([\s\S]*?)\r?\nStack:\r?\n([\s\S]*)$/;
const stackFrameRe = /^(.*?)?@(.*?):(\d+):(\d+)?$/;

class JSShell extends ConsoleAgent {
  constructor(options) {
    super(options)

    if (options.experimental) {
      // auto generated args
      this.args.unshift(
        "--enable-iterator-helpers",
        "--enable-async-iterator-helpers",
        "--enable-json-parse-with-source",
        "--enable-shadow-realms",
        "--enable-new-set-methods",
        "--enable-symbols-as-weakmap-keys",
        "--enable-arraybuffer-resizable",
        "--enable-uint8array-base64",
        "--enable-float16array",
        "--enable-regexp-duplicate-named-groups",
        "--enable-regexp-modifiers",
        "--enable-regexp-escape",
        "--enable-top-level-await",
        "--enable-import-attributes",
        "--enable-promise-try",
        "--enable-iterator-sequencing",
        "--enable-math-sumprecise",
        "--enable-error-iserror",
        "--enable-iterator-range",
        "--enable-joint-iteration",
        "--enable-atomics-pause",
        "--enable-explicit-resource-management",
        "--enable-temporal" 
      );
    }
  }

  async evalScript(code, options = {}) {
    if (options.module && this.args[0] !== '--module') {
      this.args.unshift('--module');
    }

    if (!options.module && this.args[0] === '--module') {
      this.args.shift();
    }

    return super.evalScript(code, options);
  }

  parseError(str) {
    const stack = [];
    const stackMatch = str.match(stackRe);
    if (stackMatch) {
      str = stackMatch[1];

      const stackStr = stackMatch[2];
      for (const line of stackStr.split(/\r?\n/g)) {
        const match = line.trim().match(stackFrameRe);
        if (!match) {
          continue;
        }

        stack.push({
          source: match[0],
          functionName: match[1],
          fileName: match[2],
          lineNumber: match[3],
          columnNumber: match[4],
        });
      }
    }

    const error = {};
    let match = str.match(errorRe);

    if (!match) {
      // try custom error
      let match = str.match(customErrorRe);

      if (!match) {
        return null;
      }

      error.name = match[1];
      error.message = match[2];
      error.stack = stack;
      return error;
    }

    error.name = match[4];
    error.message = match[5];

    if (stack.length === 0) {
      stack.push({
        source: match[0],
        fileName: match[1],
        lineNumber: match[2],
        columnNumber: match[3]
      });
    }
    error.stack = stack;

    return error;
  }
}
JSShell.runtime = fs.readFileSync(runtimePath.for('jsshell'), 'utf8');

module.exports = JSShell;
