const path = require("path");

const themeEntries = require("./MapStore2/build/themes.js").themeEntries;
const extractThemesPlugin = require("./MapStore2/build/themes.js").extractThemesPlugin;
const ModuleFederationPlugin = require("./MapStore2/build/moduleFederation.js").plugin;

const devServer = {
    target: "https://webgis.sir.toscana.it",
    secure: false,
    headers: {
        host: "webgis.sir.toscana.it"
    }
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
    prod: false,
    publicPath: "/dist/",
    cssPrefix: ".MapStore2-C098",
    prodPlugins: null,
    alias: {
        "@mapstore/patcher": path.resolve(__dirname, "node_modules", "@mapstore", "patcher"),
        "@mapstore": path.resolve(__dirname, "MapStore2/web/client"),
        "@js": path.resolve(__dirname, "js")
    },
    proxy: {
        "/rest/geostore": {
            ...devServer,
            target: "https://webgis.sir.toscana.it",
            pathRewrite: {"^/rest/geostore": "/mapstore/rest/geostore"}
        },
        "/pdf": {
            ...devServer,
            target: "https://webgis.sir.toscana.it/mapstore"
        },
        "/mapstore/pdf": devServer,
        "/MapStore2/proxy": devServer,
        "/geoserver/": devServer
    }
});

module.exports = webpackConfig;
