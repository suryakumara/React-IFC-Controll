module.exports = {
  webpack: {
    // configure: (config) => {
    //   const wasmExtensionRegExp = /\.wasm$/;
    //   config.resolve.extensions.push(".wasm");
    //   config.module.rules.forEach((rule) => {
    //     (rule.oneOf || []).forEach((oneOf) => {
    //       if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
    //         oneOf.exclude.push(wasmExtensionRegExp);
    //       }
    //     });
    //   });
    //   const wasmLoader = {
    //     test: /\.wasm$/,
    //     exclude: /node_modules/,
    //     loaders: ["wasm-loader"],
    //   };
    //   addBeforeLoader(config, loaderByName("file-loader", wasmLoader));
    // },
  },
  bable: {},
};
