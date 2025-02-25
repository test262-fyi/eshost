{
  // Extra block to avoid any issues with concatenating source files together.
  let buildHarness = (global) => {
    const novaObj = global.__nova__;
    delete global.__nova__;

    global.$262 = global.Object();
    global.$262.global = global;
    global.$262.detachArrayBuffer = novaObj.detachArrayBuffer;
    global.$262.createRealm = () => {
      return buildHarness(novaObj.createRealm());
    };
    global.$262.evalScript = global.eval;
    global.$262.destroy = () => {};
    return global.$262;
  };

  buildHarness(globalThis);
}
