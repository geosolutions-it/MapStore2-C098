/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {
    LOADED_ASSETS,
    CHANGE_CURRENT_ASSET,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    CHANGE_MODE,
    SELECT_MISSION,
    CHANGE_CURRENT_MISSION,
    EDIT_ASSET,
    EDIT_MISSION,
    ADD_ASSET,
    ADD_MISSION,
    DRAW_ASSET
} = require('../actions/sciadro');
import { END_DRAWING } from '@mapstore/actions/draw';
import { LOGOUT } from "@mapstore/actions/security";
import {set} from "@mapstore/utils/ImmutableUtils";
import {reproject, reprojectBbox} from "@mapstore/utils/CoordinatesUtils";
import {findIndex} from "lodash";
import uuidv1 from 'uuid/v1';


// reset prop passed for all items but toggle provided one
const updateItems = (items, id, prop = "selected") => {
    let newItems = items;
    const selectedItemIndex = findIndex(items, item => item.id === id);
    if (selectedItemIndex !== -1) {
        newItems = newItems.map((m, index) => ({...m, [prop]: index !== selectedItemIndex ? false : !m[prop]}));
    }
    return newItems;
};

const resetAllProps = (items, propsToReset = ["selected", "current"]) => {
    const props = propsToReset.reduce((p, c) => ({...p, [c]: false}), {});
    return items.map( item => ({...item, ...props}));
};

export default function sciadro(state = {
    assets: [],
    anomalies: [{
        id: 1,
        name: "insulator 1"
    },
    {
        id: 2,
        name: "insulator 2"
    }],
    missions: [{
        id: 1,
        name: "Anomalies detection",
        description: "",
        attributes: [{
            note: "",
            dateCreation: "2019-01-12T16:30:00.000Z"
        }],
        feature: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 40], [28, 49]]
            },
            style: {
                color: "#0000FF ",
                weight: 5
            }
        }
    },
    {
        id: 2,
        name: "Others Anomalies detection",
        description: "",
        attributes: [{
            note: "note for this mission",
            dateCreation: "2018-01-12T16:30:00.000Z"
        }],
        feature: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 35], [10, 36], [20, 35]]
            },
            style: {
                color: "#FF00FF",
                weight: 2
            }
        }
    }]
}, action) {
    switch (action.type) {
        case LOADED_ASSETS: {
            return {
                ...state,
                assets: action.assets.concat(state.assets.filter((a, i) => i > 2))
            };
        }
        case CHANGE_CURRENT_ASSET: {
            return {
                ...state,
                assets: updateItems(state.assets, action.id, "selected"),
                mode: "mission-list"
            };
        }
        case RESET_CURRENT_ASSET: {
            let assets = [...state.assets];
            if (state.mode === "asset-edit") {
                // exclude the one that was in edit mode
                assets = assets.filter(a => !a.edit);
            }
            return {
                ...state,
                drawMethod: "",
                missions: resetAllProps(state.missions),
                assets: resetAllProps(assets),
                mode: "asset-list"
            };
        }
        case CHANGE_MODE: {
            let assets = [...state.assets];
            let missions = [...state.missions];
            if (action.mode === "asset-edit") {
                assets = assets.concat([{
                    id: uuidv1(),
                    type: "",
                    name: "",
                    description: "",
                    note: "",
                    dateCreation: "",
                    dateModified: "",
                    edit: true
                }]);
            }
            if (action.mode === "mission-edit") {
                missions = missions.concat([{
                    id: uuidv1(),
                    name: "",
                    description: "",
                    note: "",
                    dateCreation: "",
                    edit: true
                }]);
            }
            return {
                ...state,
                assets,
                missions,
                mode: action.mode
            };
        }
        case ADD_ASSET: {
            return {
                ...state,
                mode: "asset-list"
            };
        }
        case ADD_MISSION: {
            return {
                ...state,
                mode: "mission-list"
            };
        }
        case CHANGE_CURRENT_MISSION: {
            let missions = resetAllProps(state.missions, ["selected"]);
            missions = updateItems(missions, action.id, "selected");
            missions = updateItems(missions, action.id, "current");
            return {
                ...state,
                missions,
                mode: "mission-detail"
            };
        }
        case RESET_CURRENT_MISSION: {
            /*if (state.mode === "mission-edit") {
                // exclude the one that was in edit mode
                assets = assets.filter(a => !a.edit);
            }*/
            return {
                ...state,
                missions: updateItems(state.missions, action.id, "current"),
                mode: "mission-list"
            };
        }
        case DRAW_ASSET: {
            const itemIndex = findIndex(state.assets, item => item.edit);
            return {
                ...state,
                drawMethod: action.drawMethod,
                assets: set(`[${itemIndex}].draw`, true, state.assets)
            };
        }
        case END_DRAWING: {
            if (action.owner === "sciadro") {
                const itemIndex = findIndex(state.assets, item => item.draw);
                const {type, coordinates, id, extent} = action.geometry;
                let center = reproject(action.geometry.center, "EPSG:3857", "EPSG:4326");
                const feature = {
                    type: "Feature",
                    geometry: {
                        type,
                        coordinates: type === "Point" ? [reproject(coordinates, "EPSG:3857", "EPSG:4326").x, reproject(coordinates, "EPSG:3857", "EPSG:4326").y]
                        : coordinates.map(c => {
                            const p = reproject(c, "EPSG:3857", "EPSG:4326");
                            return [p.x, p.y];
                        })
                    },
                    properties: {
                        id,
                        extent: reprojectBbox(extent, "EPSG:3857", "EPSG:4326"),
                        center: [center.x, center.y]
                    }
                };
                return {
                    ...state,
                    drawMethod: "",
                    assets: set(`[${itemIndex}].feature`, feature, set(`[${itemIndex}].draw`, false, state.assets))
                };
            }
            return state;
        }
        case SELECT_MISSION: {
            return {
                ...state,
                missions: updateItems(state.missions, action.id, "selected")
            };
        }
        case EDIT_ASSET: {
            const itemIndex = findIndex(state.assets, item => item.id === action.id);
            return {
                ...state,
                assets: set(`[${itemIndex}][${action.prop}]`, action.value, state.assets)
            };
        }
        case EDIT_MISSION: {
            const itemIndex = findIndex(state.missions, item => item.id === action.id);
            return {
                ...state,
                missions: set(`[${itemIndex}][${action.prop}]`, action.value, state.missions)
            };
        }
        case LOGOUT: {
            // reset all data on logout
            return {
                ...state,
                missions: resetAllProps(state.missions), // TODO remove this when backend works
                mode: "asset-list",
                // missions: [], TODO restore this when missions are retrieved from geostore
                // anomalies: [], TODO restore this when missions are retrieved from sciadro backend
                assets: []
            };
        }
        default:
            return state;
    }
}
