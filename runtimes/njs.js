var njs = globalThis.$262;

function print(str) {
  globalThis.print(str);
}

var $262 = {
  global: globalThis,
  gc() { /* noop */ },
  createRealm(options) {
    throw new Test262Error('createRealm() not yet supported.');
  },
  detachArrayBuffer(buffer) {
    return njs.detachArrayBuffer(buffer);
  },
  evalScript(code) {
    throw new Test262Error('evalScript() not yet supported.');
  },
  getGlobal(name) {
    return this.global[name];
  },
  setGlobal(name, value) {
    this.global[name] = value;
  },
  destroy() { /* noop */ },
  IsHTMLDDA: {},
  source: $SOURCE,
  get agent() {
    throw new Test262Error('agent.* not yet supported.');
  }
};
