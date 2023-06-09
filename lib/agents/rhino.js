'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');
const ErrorParser = require('../parse-error.js');

const errorExp = /^js: /gm;
const runtimeErrorExp = /^js: uncaught JavaScript runtime exception: (.*?): (.*)\n(\W+at .*\n?)*/gm;

class RhinoAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    this.args.unshift(
      '-version', '200',
      '-f'
    );
  }

  async evalScript(code, options = {}) {
    return super.evalScript(code, options);
  }

  parseError(str) {
    const match = str.match(errorExp);
    if (!match) return null;

    const runtimeMatch = str.match(runtimeErrorExp);
    if (runtimeErrorExp) return {
      name: runtimeMatch[1],
      message: runtimeMatch[2],
      stack: []
    };

    return {
      name: 'SyntaxError',
      message: '',
      stack: []
    };
  }

  normalizeResult(result) {
    const runtimeMatch = result.stdout.match(runtimeErrorExp);
    if (runtimeMatch) {
      result.stdout = result.stdout.replace(runtimeMatch, '');
      result.stderr = runtimeMatch[0];
    }

    const match = result.stdout.match(errorExp);
    if (match) {
      result.stdout = result.stdout.replace(errorexp, '');
      result.stderr = match[0];
    }

    return result;
  }
}

RhinoAgent.runtime = fs.readFileSync(runtimePath.for('rhino'), 'utf8');
module.exports = RhinoAgent;