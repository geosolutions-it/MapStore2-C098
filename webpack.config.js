const path = require("path");

const themeEntries = require("./MapStore2/build/themes.js").themeEntries;
const extractThemesPlugin = require("./MapStore2/build/themes.js").extractThemesPlugin;
const ModuleFederationPlugin = require("./MapStore2/build/moduleFederation.js").plugin;

/**
 * dev instance variables
 * const protocol = "https";
 * const port = "";
 * const domain = "webgis.sir.toscana.it";
 */

const protocol = "http";
const port = "8080";
const host = "localhost";
const basePath = "/mapstore";

const devServerUrl = `${protocol}://${host}${port ? ":" + port : ""}${basePath}`;
const devServer = {
    target: devServerUrl,
    secure: false,
    headers: {
        host: host
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
        "/rest/geostore": devServer,
        "/pdf": devServer,
        "/proxy": devServer,
        "/geoserver/": {
            target: "https://webgis.cfr.toscana.it",
            secure: false,
            headers: {
                host: "webgis.cfr.toscana.it"
            }
        }
    }
});

module.exports = {
    ...webpackConfig,
    plugins: [
        ...(webpackConfig.plugins || []),
        ...(require('./module-replacements.webpack') || [])
    ]
};
