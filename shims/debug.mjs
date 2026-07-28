// ESM replacement for the 'debug' CJS module.
// engine.io-client/esm-debug does `import debug from 'debug'`,
// but debug's browser.js is CJS and Vite fails CJS→ESM conversion.
// This provides a noop implementation since debug is only used for logging.

function createDebug(namespace) {
    const fn = (..._args) => {};
    fn.extend = (ns) => createDebug(namespace + ':' + ns);
    fn.namespace = namespace;
    fn.enabled = false;
    fn.useColors = false;
    fn.color = '';
    fn.destroy = () => {};
    fn.log = (..._args) => {};
    return fn;
}

const debug = (ns) => createDebug(ns);
debug.default = debug;
debug.extend = createDebug;
debug.enable = () => {};
debug.disable = () => '';
debug.enabled = () => false;
debug.names = [];
debug.skips = [];
debug.colors = [];
debug.log = (..._args) => {};

export default debug;
