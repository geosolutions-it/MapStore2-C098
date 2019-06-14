const path = require("path");
const themeEntries = require('./MapStore2/build/themes.js').themeEntries;
const extractThemesPlugin = require('./MapStore2/build/themes.js').extractThemesPlugin;

const config = require('./MapStore2/build/buildConfig')(
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
    '.MapStore2-C098',
    null,
    {
        '@mapstore': path.resolve(__dirname, 'MapStore2/web/client'),
        '@js': path.resolve(__dirname, 'js')
    }
);

config.devServer.proxy = {
    '/assets': {
        target: "http://164.132.80.75"
    }
};

module.exports = config;
