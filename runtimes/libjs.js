function print(...args) {
  console.log(...args);
}
var $262 = {
  global: globalThis,
  gc() {
    return gc();
  },
  createRealm(options) {
    throw new InternalError('createRealm() not supported');
  },
  evalScript(code) {
    throw new InternalError('evalScript() not supported');
  },
  getGlobal(name) {
    return this.global[name];
  },
  setGlobal(name, value) {
    this.global[name] = value;
  },
  clearKeptObjects() {
    throw new InternalError('clearKeptObjects() not supported');
  },
  detachArrayBuffer() {
    throw new InternalError('detachArrayBuffer() not supported');
  },
  destroy() { /* noop */ },
  IsHTMLDDA() { return {}; },
  source: $SOURCE,
  get agent() {
    throw new InternalError('agent.* not supported');
  }
};
