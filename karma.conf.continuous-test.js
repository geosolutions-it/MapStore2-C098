const path = require("path");

module.exports = function karmaConfig(config) {
    const testConfig = require('./MapStore2/build/testConfig')({
        files: [
            'tests.webpack.js',
            { pattern: './js/test-resources/**/*', included: false },
            { pattern: './MapStore2/web/client/test-resources/**/*', included: false }
        ],
        path: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")],
        testFile: 'tests.webpack.js',
        singleRun: false,
        alias: {
            "@mapstore/patcher": path.resolve(__dirname, "node_modules", "@mapstore", "patcher"),
            '@mapstore': path.resolve(__dirname, 'MapStore2/web/client'),
            '@js': path.resolve(__dirname, 'js')
        }
    });

    testConfig.webpack.plugins = [
        ...(testConfig.webpack.plugins || []),
        ...(require('./module-replacements.webpack') || [])
    ];

    config.set(testConfig);
};
