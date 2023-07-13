function print(str) {
  Kiesel.print(str);
}

// TODO: Update this to `var` and function properties once supported
globalThis.$262 = {
  global: globalThis,
  gc: function gc() {
    return Kiesel.gc.collect();
  },
  createRealm: function createRealm(options) {
    var realm = Kiesel.createRealm();
    realm.eval(this.source);
    realm.$262.source = this.source;
    return realm.$262;
  },
  evalScript: function evalScript(code) {
    return Kiesel.evalScript(code);
  },
  getGlobal: function getGlobal(name) {
    return this.global[name];
  },
  setGlobal: function setGlobal(name, value) {
    this.global[name] = value;
  },
  destroy: function destroy() { /* noop */ },
  IsHTMLDDA: function IsHTMLDDA() { return {}; },
  source: $SOURCE,
  agent: {},
};
