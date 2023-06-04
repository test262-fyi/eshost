function print(...args) {
  console.log(...args);
}
var $262 = {
  global: globalThis,
  gc() {
    return gc();
  },
  createRealm(options) {
    throw new Test262Error('createRealm() not yet supported.');
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
  clearKeptObjects() {
    throw new Test262Error('clearKeptObjects() not yet supported.');
  },
  detachArrayBuffer() {
    throw new Test262Error('detachArrayBuffer() not yet supported.');
  },
  destroy() { /* noop */ },
  IsHTMLDDA() { return {}; },
  source: $SOURCE,
  get agent() {
    throw new Test262Error('agent.* not yet supported.');
  }
};
