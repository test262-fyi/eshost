'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

class JawsmAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    // disable node error coloring stuff
    this.cpOptions = {
      env: {
        NO_COLOR: 1
      }
    };

  }

  async evalScript(code, options = {}) {
    return super.evalScript(code, options);
  }

  parseError(str) {
    return super.parseError(str);
  }
}

JawsmAgent.runtime = fs.readFileSync(runtimePath.for('jawsm'), 'utf8');

module.exports = JawsmAgent;
