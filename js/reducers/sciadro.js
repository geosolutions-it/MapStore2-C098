/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {
    LOADED_ASSETS,
    SELECT_ASSET,
    LOADING_ASSETS,
    LOADING_MISSIONS,
    CHANGE_CURRENT_ASSET,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    CHANGE_MODE,
    SELECT_MISSION,
    CHANGE_CURRENT_MISSION,
    EDIT_ASSET,
    EDIT_MISSION,
    EDIT_ASSET_PERMISSION,
    SAVE_ASSET,
    ADD_MISSION,
    DRAW_ASSET,
    UPDATE_ASSET,
    ENTER_CREATE_ITEM,
    ENTER_EDIT_ITEM,
    DELETE_FEATURE_ASSET
} from '@js/actions/sciadro';

import {assetSelectedSelector, missionSelectedSelector} from '@js/selectors/sciadro';
import { END_DRAWING } from '@mapstore/actions/draw';
import { LOGOUT, LOGIN_SUCCESS } from "@mapstore/actions/security";
import {set} from "@mapstore/utils/ImmutableUtils";
import {getStyleFromType} from "@js/utils/sciadro";
import {reproject, reprojectBbox} from "@mapstore/utils/CoordinatesUtils";
import {findIndex} from "lodash";
import uuidv1 from 'uuid/v1';

const updateItem = (items, id, props = {}) => {
    let newItems = [...items];
    const itemIndex = findIndex(items, item => item.id === id);
    if (itemIndex !== -1) {
        newItems[itemIndex] = {...newItems[itemIndex], ...props};
    }
    return newItems;
};

// reset prop passed for all items but toggle provided one
const toggleItemsProps = (items, id, prop = "selected") => {
    let newItems = [...items];
    const selectedItemIndex = findIndex(items, item => item.id === id);
    if (selectedItemIndex !== -1) {
        newItems = newItems.map((m, index) => ({...m, [prop]: index !== selectedItemIndex ? false : !m[prop]}));
    }
    return newItems;
};
const updateDroneProps = (items, id, props = {}) => {
    let newItems = [...items];
    const selectedItemIndex = findIndex(items, item => item.id === id);
    if (selectedItemIndex !== -1) {
        let currentItem = newItems[selectedItemIndex];
        if (currentItem.drone) {
            newItems = set(`[${selectedItemIndex}].drone.properties`, {...(currentItem.drone.properties || {}), ...props}, newItems);
        } else {
            newItems = set(`[${selectedItemIndex}].drone`, null, newItems);
        }
    }
    return newItems;
};

const resetProps = (items, propsToReset = ["selected", "current"]) => {
    const props = propsToReset.reduce((p, c) => ({...p, [c]: false}), {});
    return items.map( item => ({...item, ...props}));
};

const isEditedItemValid = (type, item) => {
    switch (type) {
        case "asset": return !!item.name && !!item.type;
        case "mission": return !!item.name;
        default: return false;
    }
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
                coordinates: [[0.20, 40], [28, 49]]
            },
            style: {
                color: "#FF0000",
                weight: 5
            }
        },
        drone: {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [0.20, 40]
            },
            style: {
                iconAnchor: [0.5, 1.1],
                iconUrl: "assets/images/pointing-up-arrow.svg",
                rotation: 0
            },
            properties: {
                rotation: 0,
                isVisible: false
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
                color: "#FF0000",
                weight: 2
            }
        }
    }]
}, action) {
    switch (action.type) {
        case EDIT_ASSET_PERMISSION: {
            return {
                ...state,
                mode: "asset-permission",
                assets: toggleItemsProps(state.assets, action.id, "permission")
            };
        }
        case LOGIN_SUCCESS: {
            return {
                ...state,
                loadingAssets: true
            };
        }
        case LOADED_ASSETS: {
            return {
                ...state,
                loadingAssets: false,
                assets: action.assets.concat(state.assets.filter((a, i) => i > 2))
            };
        }
        case UPDATE_ASSET: {
            return {
                ...state,
                assets: updateItem(state.assets, action.id, action.props)
            };
        }
        case DELETE_FEATURE_ASSET: {
            return {
                ...state,
                assets: updateItem(state.assets, action.id, { feature: null })
            };
        }
        case ENTER_CREATE_ITEM: {
            let assets = [...state.assets];
            let missions = [...state.missions];
            return {
                ...state,
                assets: action.mode === "asset-edit" ? assets.concat([{
                    id: uuidv1(),
                    type: "powerline",
                    name: "",
                    description: "",
                    note: "",
                    dateCreation: null,
                    dateModified: null,
                    edit: true,
                    isNew: true
                }]) : state.assets,
                missions: action.mode === "mission-edit" ? missions.concat([{
                    id: uuidv1(),
                    name: "",
                    description: "",
                    note: "",
                    dateCreation: null,
                    edit: true,
                    isNew: true
                }]) : state.missions,
                saveDisabled: true,
                mode: action.mode
            };
        }
        case ENTER_EDIT_ITEM: {
            let assets = [...state.assets];
            let missions = [...state.missions];
            const selectedAsset = assetSelectedSelector({sciadro: state});
            const selectedMission = missionSelectedSelector({sciadro: state});
            if (action.mode === "asset-edit") {
                if (selectedAsset) {
                    assets = toggleItemsProps(state.assets, selectedAsset.id, "edit");
                }
            }
            if (action.mode === "mission-edit") {
                if (selectedMission) {
                    missions = toggleItemsProps(state.missions, selectedMission.id, "edit");
                }
            }
            return {
                ...state,
                assets,
                missions,
                oldItem: selectedAsset || selectedMission,
                saveDisabled: false,
                mode: action.mode
            };
        }
        case CHANGE_MODE: {
            return {
                ...state,
                mode: action.mode
            };
        }
        case SAVE_ASSET: {
            return {
                ...state,
                reloadAsset: true,
                loadingAssets: true,
                assets: resetProps(state.assets, ["edit", "isNew"]),
                mode: "asset-list"
            };
        }
        case ADD_MISSION: {
            return {
                ...state,
                mode: "mission-list"
            };
        }
        case SELECT_ASSET: {
            return {
                ...state,
                assets: toggleItemsProps(state.assets, action.id, "selected")
            };
        }
        case CHANGE_CURRENT_ASSET: {
            let assets = resetProps(state.assets, ["selected"]);
            assets = toggleItemsProps(assets, action.id, "selected");
            assets = toggleItemsProps(assets, action.id, "current");
            return {
                ...state,
                assets,
                mode: "mission-list"
            };
        }
        case CHANGE_CURRENT_MISSION: {
            let missions = resetProps(state.missions, ["selected"]);
            missions = toggleItemsProps(missions, action.id, "selected");
            missions = toggleItemsProps(missions, action.id, "current");
            missions = updateDroneProps(missions, action.id, { isVisible: true });
            return {
                ...state,
                missions,
                mode: "mission-detail"
            };
        }
        case RESET_CURRENT_ASSET: {
            let assets = [...state.assets];
            if (state.mode === "asset-edit") {
                // exclude the one that was in edit mode for new item
                assets = assets.filter(a => !a.isNew);
                const oldAsset = state.oldItem;
                if (oldAsset && oldAsset.id) {
                    const selectedItemIndex = findIndex(assets, item => item.id === oldAsset.id);
                    assets[selectedItemIndex] = oldAsset;
                }
            }
            return {
                ...state,
                drawMethod: "",
                reloadAsset: false,
                missions: resetProps(state.missions),
                assets: resetProps(assets, ["current"]),
                oldItem: null,
                mode: "asset-list"
            };
        }
        case RESET_CURRENT_MISSION: {
            let missions = [...state.missions];
            if (state.mode === "mission-edit") {
                // exclude the one that was in edit mode
                missions = missions.filter(a => !a.isNew);
            }
            const currentMissionIndex = findIndex(missions, item => item.current);
            if (currentMissionIndex !== -1) {
                missions = updateDroneProps(missions, missions[currentMissionIndex].id, { isVisible: false });
                missions = toggleItemsProps(missions, missions[currentMissionIndex].id, "current");
            }
            return {
                ...state,
                missions,
                mode: "mission-list"
            };
        }
        case DRAW_ASSET: {
            const itemIndex = findIndex(state.assets, item => (item.edit));
            return {
                ...state,
                drawMethod: action.drawMethod,
                assets: set(`[${itemIndex}].draw`, true, state.assets) // potentially useless, see edit property
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
                    },
                    style: getStyleFromType(type)
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
                missions: toggleItemsProps(state.missions, action.id, "selected")
            };
        }
        case EDIT_ASSET: {
            const itemIndex = findIndex(state.assets, item => item.id === action.id);
            const assets = set(`[${itemIndex}][${action.prop}]`, action.value, state.assets);
            return {
                ...state,
                saveDisabled: !isEditedItemValid("asset", assets[itemIndex]),
                assets
            };
        }
        case EDIT_MISSION: {
            const itemIndex = findIndex(state.missions, item => item.id === action.id);
            const missions = set(`[${itemIndex}][${action.prop}]`, action.value, state.missions);
            return {
                ...state,
                saveDisabled: !isEditedItemValid("mission", missions[itemIndex]),
                missions
            };
        }
        case LOGOUT: {
            // reset all data on logout
            return {
                ...state,
                missions: resetProps(state.missions), // TODO remove this when backend works
                mode: "asset-list",
                // missions: [], TODO restore this when missions are retrieved from geostore
                // anomalies: [], TODO restore this when missions are retrieved from sciadro backend
                assets: []
            };
        }
        case LOADING_ASSETS: {
            return {
                ...state,
                loadingAssets: action.loading
            };
        }
        case LOADING_MISSIONS: {
            return {
                ...state,
                loadingMissions: action.loading
            };
        }
        default:
            return state;
    }
}
