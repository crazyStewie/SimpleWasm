import init, * as wasmlib from './lib/wasm/wasmlib/pkg/wasmlib.js'

async function run() {
    await init();
    //await init();
    main();
}

function main() {
    console.log("Main started");
    wasmlib.greet();
}

run();
