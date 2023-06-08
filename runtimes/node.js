function print() {
  console.log.apply(global, arguments);
}

var vm = require('vm');
var fs = require('fs');
var $262 = {
  global: Function('return this')(),
  gc: function() {
    return gc();
  },
  createRealm: function(options) {
    options = options || {};
    options.globals = options.globals || {};

    context = {
      console: console,
      require: require,
      print: print,
    };

    var keys = Object.keys(options.globals);
    for (var i = 0; i < keys.length; i++) {
      context[keys[i]] = options.globals[keys[i]];
    }

    var context = vm.createContext(context);
    for (var i = 0; i < this.preludes.length; i++) {
      vm.runInContext(this.preludes[i], context);
    }
    vm.runInContext(this.source, context);
    context.$262.source = this.source;
    context.$262.context = context;
    context.$262.destroy = function () {
      if (options.destroy) {
        options.destroy();
      }
    };
  
    return context.$262;
  },
  evalScript: function(code) {
    try {
      if (this.context) {
        vm.runInContext(code, this.context, { displayErrors: false });
      } else {
        vm.runInESHostContext(code, { displayErrors: false });
      }

      return { type: 'normal', value: undefined };
    } catch (e) {
      return { type: 'throw', value: e };
    }
  },
  getGlobal: function(name) {
    return this.global[name];
  },
  setGlobal: function(name, value) {
    this.global[name] = value;
  },
  destroy: function() { /* noop */ },
  IsHTMLDDA: function() { return {}; },
  preludes: [],
  source: $SOURCE
};