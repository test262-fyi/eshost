'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');
const ErrorParser = require('../parse-error.js');

const errorRe = /(.*?):(\d+): (([\w\d]+)(?:: (.*))?)[\w\W]*(\3((:?\s+at.*\r?\n)*)(\r?\n)+)?$/;

class D8Agent extends ConsoleAgent {
  constructor(options) {
    super(options);
    
    // this.args.unshift('--expose-gc', '--experimental', '--harmony', '--harmony-weak-refs-with-cleanup-some', '--harmony-temporal', '--harmony-shadow-realm', '--harmony-array-from-async', '--harmony-structs', '--harmony-set-methods', '--harmony-intl-best-fit-matcher', '--harmony-remove-intl-locale-info-getters', '--harmony-intl-locale-info-func', '--harmony-intl-duration-format');
    this.args.unshift('--expose-gc', '--experimental', '--harmony');
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
    const match = str.match(errorRe);
    if(!match) {
      return null;
    }
    const stackStr = match[6] || '';

    let stack;
    if (stackStr.trim().length > 0) {
      stack = ErrorParser.parseStack(stackStr);
    } else {
      stack = [{
        source: match[0],
        fileName: match[1],
        lineNumber: match[2]
      }];
    }

    return {
      name: match[4],
      message: match[5],
      stack: stack,
    };
  }

  normalizeResult(result) {
    const match = result.stdout.match(errorRe);

    if (match) {
      result.stdout = result.stdout.replace(errorRe, '');
      result.stderr = match[0];
    }

    return result;
  }
}

D8Agent.runtime = fs.readFileSync(runtimePath.for('d8'), 'utf8');

module.exports = D8Agent;
