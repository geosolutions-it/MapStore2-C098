/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import productPlugins from '@mapstore/product/plugins';

// custom plugins
import TOCPlugin from '@js/plugins/TOC';
import IdentifyPlugin from '@js/plugins/Identify';
import TOCItemsSettingsPlugin from '@js/plugins/TOCItemsSettings';

const exclude = [
    "ForkPlugin",
    "MadeWithLovePlugin",
    "MapTypePlugin",
    "NavMenuPlugin",
    "FloatingLegendPlugin",
    "GridContainerPlugin",
    "ThemeSwitcherPlugin"
];

const plugins = {
    ...(Object.keys(productPlugins.plugins).reduce(
        (prev, el) => exclude.includes(el) ? prev : {...prev, [el]: productPlugins.plugins[el]}, {}
    )),
    // custom plugins
    TOCPlugin,
    IdentifyPlugin,
    TOCItemsSettingsPlugin
};

export default {
    plugins,
    requires: productPlugins.requires
};
