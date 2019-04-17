const path = require("path");
const themeEntries = require('./MapStore2/themes.js').themeEntries;
const extractThemesPlugin = require('./MapStore2/themes.js').extractThemesPlugin;

const config = require('./MapStore2/buildConfig')(
    {
        'sciadro': path.join(__dirname, "js", "sciadro"),
        'themes-sciadro': path.join(__dirname, "assets", "themes", "sciadro.less") // custom theme for sciadro
    },
    themeEntries,
    {
        base: __dirname,
        dist: path.join(__dirname, "dist"),
        framework: path.join(__dirname, "MapStore2", "web", "client"),
        code: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
    },
    extractThemesPlugin,
    false,
    "/dist/",
    '.MapStore2-C098'
);

config.devServer.proxy = {
    '/rest/geostore': {
        target: "http://localhost:8040/mapstore"
    },
    '/proxy': {
        target: "http://localhost:8040/mapstore"
    },
    '/pdf': {
        target: "http://localhost:8040/mapstore"
    }
};
config.resolve.alias = {
    '@mapstore': path.resolve(__dirname, 'MapStore2/web/client'),
    '@js': path.resolve(__dirname, 'js')
};

module.exports = config;
