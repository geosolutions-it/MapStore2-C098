/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ConfigUtils from '../MapStore2/web/client/utils/ConfigUtils';

/**
 * Use a custom plugins configuration file with:
 *
 */
ConfigUtils.setLocalConfigurationFile('localConfig.json');

/**
 * Use a custom application configuration file with:
 */
import appConfig from './appConfigSciadro';

/**
 * Define a custom list of plugins with:
 */
import plugins from './pluginsSciadro';

import main from '../MapStore2/web/client/product/main';
main(appConfig, plugins);
