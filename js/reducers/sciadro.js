/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {
    LOADED_ASSETS
} = require('../actions/sciadro');


export default function sciadro(state = {
    assets: [],
    missions: [{
        id: 1,
        name: "Anomalies detection",
        description: "",
        attributes: [{
            note: "",
            dateCreation: "2019-01-12T16:30:00.000Z"
        }]
    }]
}, action) {
    switch (action.type) {
    case LOADED_ASSETS:
        return {
            ...state,
            assets: action.assets
        };
    default:
        return state;
    }
}
