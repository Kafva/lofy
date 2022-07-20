import init, { run, big_xd  } from './pkg/lofy.js';
(async function main() {
  await init('/lofy_bg.wasm');
  run();
  big_xd();

})();
