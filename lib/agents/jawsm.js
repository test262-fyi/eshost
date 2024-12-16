"use strict";

const fs = require("fs");
const runtimePath = require("../runtime-path");
const ConsoleAgent = require("../ConsoleAgent");

const errorExp = /^RuntimeException: Uncaught (.+?): (.+)$/m;

class JawsmAgent extends ConsoleAgent {
  constructor(options) {
    super(options);

    this.args.unshift("--test262");
  }

  async evalScript(code, options = {}) {
    return super.evalScript(code, options);
  }

  parseError(str) {
    const match = str.match(errorExp);

    if (!match) return null;

    return {
      name: match[1],
      message: match[2],
      stack: [],
    };
  }
}

JawsmAgent.runtime = fs.readFileSync(runtimePath.for("jawsm"), "utf8");

module.exports = JawsmAgent;
