/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from '../../MapStore2/web/client/utils/PluginsUtils';
import assign from 'object-assign';
import { createSelector } from 'reselect';

import Container from '../components/Container';

/**
 * Sciadro plugins allows to manage Assets and Missions
 * @class
 * @memberof plugins
 * @prop {boolean} [show] show the opened main panel default true
*/

const Sciadro = connect(createSelector([
    state => state.controls && state.controls.sciadro && state.controls.sciadro.enabled
], (show) => ({
    show
})), {
    // action: ActionCreator
})(Container);

export const SciadroPlugin = assign({}, Sciadro);

/*
export const reducers = { controls };
export const epics = shareEpics;
*/
