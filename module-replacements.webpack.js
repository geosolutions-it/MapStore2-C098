const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');

module.exports = [
    new NormalModuleReplacementPlugin(/MapStore2[\\\/]web[\\\/]client[\\\/]epics[\\\/]maplayout\.js/, '../../../../js/epics/maplayout.js'),
    new NormalModuleReplacementPlugin(/MapStore2[\\\/]web[\\\/]client[\\\/]components[\\\/]map[\\\/]cesium[\\\/]plugins[\\\/]WMSLayer\.js/, '../../../../../../../js/components/map/cesium/plugins/WMSLayer.js')
];
