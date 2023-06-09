var cx = Packages.org.mozilla.javascript.Context.enter();
// TODO: does this create a separate scope? it should not (?) but there is no way to get our/global scope?
var scope = cx.initSafeStandardObjects();

var $262 = {
  global: globalThis,
  gc() {
    return gc();
  },
  createRealm(options) {
    options = options || {};
    options.globals = options.globals || {};

    context = {
      print: print,
    };

    var keys = Object.keys(options.globals);
    for (var i = 0; i < keys.length; i++) {
      context[keys[i]] = options.globals[keys[i]];
    }

    var realm = cx.initSafeStandardObjects();
    realm.eval(this.source);
    realm.$262.source = this.source;
    realm.$262.context = context;
    realm.$262.destroy = function () {
      if (options.destroy) {
        options.destroy();
      }
    };
  
    return realm.$262;
  },
  evalScript(code) {
    try {
      cx.evaluateString(scope, code, "<evalScript>", 1, null);
      return { type: 'normal', value: undefined };
    } catch (e) {
      return { type: 'throw', value: e };
    }
  },
  getGlobal(name) {
    return this.global[name];
  },
  setGlobal(name, value) {
    this.global[name] = value;
  },
  destroy() { /* noop */ },
  IsHTMLDDA() { return {}; },
  source: $SOURCE,
  get agent() {
    throw new Test262Error('agent.* not yet supported.');
  }
};