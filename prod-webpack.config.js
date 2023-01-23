const path = require("path");

const extractThemesPlugin = require("./MapStore2/build/themes.js").extractThemesPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("./MapStore2/build/moduleFederation.js").plugin;
const themeEntries = require("./MapStore2/build/themes.js").themeEntries;

const paths = {
    base: __dirname,
    dist: path.join(__dirname, "dist"),
    framework: path.join(__dirname, "MapStore2", "web", "client"),
    code: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
};

const webpackConfig = require("./MapStore2/build/buildConfig")({
    bundles: {
        "MapStore2-C098": path.join(__dirname, "js", "app"),
        "MapStore2-C098-embedded": path.join(__dirname, "js", "embedded"),
        "MapStore2-C098-api": path.join(__dirname, "MapStore2", "web", "client", "product", "api"),
        "geostory-embedded": path.join(__dirname, "js", "geostoryEmbedded"),
        "dashboard-embedded": path.join(__dirname, "js", "dashboardEmbedded")
    },
    themeEntries,
    paths: {
        base: __dirname,
        dist: path.join(__dirname, "dist"),
        framework: path.join(__dirname, "MapStore2", "web", "client"),
        code: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
    },
    plugins: [extractThemesPlugin, ModuleFederationPlugin],
    prod: true,
    publicPath: undefined,
    cssPrefix: ".MapStore2-C098",
    prodPlugins: [
        new HtmlWebpackPlugin({
            template: path.join(paths.base, "indexTemplate.html"),
            chunks: ["MapStore2-C098"],
            publicPath: 'dist/',
            inject: "body",
            hash: true
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.base, "embeddedTemplate.html"),
            chunks: ["MapStore2-C098-embedded"],
            publicPath: 'dist/',
            inject: "body",
            hash: true,
            filename: "embedded.html"
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.base, "apiTemplate.html"),
            chunks: ["MapStore2-C098-api"],
            publicPath: 'dist/',
            inject: "head",
            hash: true,
            filename: "api.html"
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'geostory-embedded-template.html'),
            chunks: ['geostory-embedded'],
            publicPath: 'dist/',
            inject: "body",
            hash: true,
            filename: 'geostory-embedded.html'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'dashboard-embedded-template.html'),
            chunks: ['dashboard-embedded'],
            publicPath: 'dist/',
            inject: 'body',
            hash: true,
            filename: 'dashboard-embedded.html'
        })
    ],
    alias: {
        "@mapstore/patcher": path.resolve(__dirname, "node_modules", "@mapstore", "patcher"),
        "@mapstore": path.resolve(__dirname, "MapStore2/web/client"),
        "@js": path.resolve(__dirname, "js")
    }
});

module.exports = {
    ...webpackConfig,
    plugins: [
        ...(webpackConfig.plugins || []),
        ...(require("./module-replacements.webpack") || [])
    ]
};
