'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorRe = /^Uncaught exception: (.+?)(?:: (.+))?$/m;
const parseErrorRe = /^Parse errors:\s*(?:\r?\n|\r)+\s+[x×](.+)/m;

class NovaAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    this.args.unshift('eval');
  }

  async evalScript(code, options = {}) {
    // if (options.module && this.args[0] !== '--module') {
    //   this.args.unshift('--module');
    // }

    // if (!options.module && this.args[0] === '--module') {
    //   this.args.shift();
    // }

    return super.evalScript(code, options);
  }

  parseError(str) {
    const parseErrorMatch = str.match(parseErrorRe);
    if (parseErrorMatch) {
      return {
        name: "SyntaxError",
        message: parseErrorMatch[1].trim(),
        stack: []
      };
    }

    const match = str.match(errorRe);
    if (match) {
      return {
        name: match[1].trim(),
        message: match[2] ? match[2].trim() : "",
        stack: []
      };
    }

    return null;
  }
}

NovaAgent.runtime = fs.readFileSync(runtimePath.for('nova'), 'utf8');

module.exports = NovaAgent;
