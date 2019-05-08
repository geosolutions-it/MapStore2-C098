const path = require("path");

const themeEntries = require('./MapStore2/build/themes.js').themeEntries;
const extractThemesPlugin = require('./MapStore2/build/themes.js').extractThemesPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = {
    base: __dirname,
    dist: path.join(__dirname, "dist"),
    framework: path.join(__dirname, "MapStore2", "web", "client"),
    code: [path.join(__dirname, "js"), path.join(__dirname, "MapStore2", "web", "client")]
};

module.exports = require('./MapStore2/build/buildConfig')(
    {
        'sciadro': path.join(__dirname, "js", "sciadro"),
        'themes-sciadro': path.join(__dirname, "assets", "themes", "sciadro.less") // custom theme for sciadro
    },
    themeEntries,
    paths,
    extractThemesPlugin,
    true,
    "dist/",
    '.MapStore2-C098',
    [
        new HtmlWebpackPlugin({
            template: path.join(paths.base, 'indexTemplate.html'),
            chunks: ['sciadro'],
            inject: true,
            hash: true
        })
    ]
);
