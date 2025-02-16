const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "buffer": require.resolve("buffer/"),
        "zlib": require.resolve("browserify-zlib"),
        "url": require.resolve("url/")
    });
    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);
    
    return config;
} 