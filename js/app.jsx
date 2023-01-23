/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ConfigUtils from "@mapstore/utils/ConfigUtils";
import appConfig from "@mapstore/product/appConfig";
import main from "@mapstore/product/main";

import plugins from "@js/plugins";

import "./customizations.css";

/**
 * Add custom (overriding) translations with:
 *
 * ConfigUtils.setConfigProp('translationsPath', ['./MapStore2/web/client/translations', './translations']);
 */
ConfigUtils.setConfigProp('themePrefix', 'MapStore2-C098');

/**
 * Use a custom plugins configuration file with:
 * ConfigUtils.setLocalConfigurationFile('MapStore2/web/client/localConfig.json');
 *
 */

ConfigUtils.setLocalConfigurationFile('configs/localConfig.json');

/**
 * Use a custom application configuration file with:
 *
 * const appConfig = require('./appConfig');
 *
 * Or override the application configuration file with (e.g. only one page with a mapviewer):
 *
 * const appConfig = assign({}, require('../MapStore2/web/client/product/appConfig'), {
 *     pages: [{
 *         name: "mapviewer",
 *         path: "/",
 *         component: require('../MapStore2/web/client/product/pages/MapViewer')
 *     }]
 * });
 */

/**
 * Define a custom list of plugins with:
 *
 * const plugins = require('./plugins');
 */

main(appConfig, plugins);
