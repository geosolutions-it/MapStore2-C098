/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Container from '@js/components/Container';

import {
    ToolbarConnected,
    MissionDetailConnected,
    // AnomaliesListConnected,
    MissionEditConnected,
    MissionListConnected,
    AssetPermissionConnected,
    AssetEditConnected,
    AssetListConnected
} from './index';

import sciadro from '@js/reducers/sciadro';
import * as sciadroEpics from '@js/epics/sciadro';
import {
    enabledSelector,
    modeSelector
} from '@js/selectors/sciadro';

/**
 * Sciadro plugins allows to manage Assets and Missions
 * @class
 * @memberof plugins
 * @prop {boolean} [show] show the opened main panel default true
*/
export const Sciadro = connect(createSelector([
    enabledSelector,
    modeSelector
], (show, mode) => ({
    show, mode,
    renderBodyComponents: {
        "asset-list": AssetListConnected,
        "asset-edit": AssetEditConnected,
        "asset-permission": AssetPermissionConnected, // todo remove, and move it in asset-edit
        "mission-edit": MissionEditConnected,
        "mission-list": MissionListConnected,
        "mission-detail": MissionDetailConnected
    },
    renderToolbarComponent: ToolbarConnected
})), {})(Container);

export const SciadroPlugin = assign(Sciadro);
export const reducers = { sciadro };
export const epics = sciadroEpics;
