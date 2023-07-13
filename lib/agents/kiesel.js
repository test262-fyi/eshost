'use strict';

const fs = require('fs');
const runtimePath = require('../runtime-path');
const ConsoleAgent = require('../ConsoleAgent');

const errorRe = /^Uncaught exception: (.+?)(?:: (.+))?$/m;

class KieselAgent extends ConsoleAgent {
  parseError(str) {
    const match = str.match(errorRe);

    if (!match)
      return null;

    const name = match[1] ? match[1].trim() : "";
    let message = match[2] ? match[2].trim() : "";

    try {
      const parsedMessage = JSON.parse(message);
      if (typeof parsedMessage["message"] === 'string')
        message = parsedMessage["message"];
    } catch (e) {
      // ignored
    }

    // TODO: Implement this once kiesel prints out the call stack for uncaught exceptions.
    const stack = [];

    return {
      name,
      message,
      stack
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

KieselAgent.runtime = fs.readFileSync(runtimePath.for('kiesel'), 'utf8');

module.exports = KieselAgent;
