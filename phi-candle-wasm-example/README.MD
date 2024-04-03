This code is a fork from https://github.com/huggingface/candle/tree/main/candle-wasm-examples/phi.

To build and test the UI made in Vanilla JS and WebWorkers, first we need to build the WASM library:

```
sh build-lib.sh
```

This will bundle the library under ./build and we can import it inside our WebWorker like a normal JS module (this will be done in the landing page repo):

```
import init, { Model } from "./build/m.js";
```

All needed assets are fetched from the web, so no need to download anything. Finally, you can preview the example by running a local HTTP server. For example:




