/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Map from '@mapstore/plugins/Map';
import * as Toolbar from '@mapstore/plugins/Toolbar';
import * as Login from '@mapstore/plugins/Login';
import * as OmniBar from '@mapstore/plugins/OmniBar';
import * as Notifications from '@mapstore/plugins/Notifications';
import * as Sciadro from './plugins/Sciadro';

module.exports = {
    plugins: {
        MapPlugin: Map,
        ToolbarPlugin: Toolbar,
        LoginPlugin: Login,
        OmniBarPlugin: OmniBar,
        NotificationsPlugin: Notifications,
        SciadroPlugin: Sciadro
    },
    requires: {}
};
