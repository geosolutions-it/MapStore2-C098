const path = require("path");

module.exports = function karmaConfig(config) {
    const testConfig = require('./MapStore2/testConfig')({
        files: [
            'tests.webpack.js',
            { pattern: './js/test-resources/**/*', included: false }
        ],
        path: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")],
        testFile: 'tests.webpack.js',
        singleRun: false
    });
    testConfig.webpack.resolve = {
        alias: { '@mapstore': path.resolve(__dirname, 'MapStore2/web/client')},
        ...testConfig.webpack.resolve
    };
    config.set(testConfig);
};
