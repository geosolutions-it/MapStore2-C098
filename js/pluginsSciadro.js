/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Map from '../MapStore2/web/client/plugins/Map';
import * as Toolbar from '../MapStore2/web/client/plugins/Toolbar';
import * as Login from '../MapStore2/web/client/plugins/Login';
import * as OmniBar from '../MapStore2/web/client/plugins/OmniBar';
import * as Notifications from '../MapStore2/web/client/plugins/Notifications';
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
