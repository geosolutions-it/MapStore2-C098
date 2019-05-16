/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { updateAdditionalLayer, removeAdditionalLayer } from "@mapstore/actions/additionallayers";
import { findIndex, head, last, find } from "lodash";
import { set } from "@mapstore/utils/ImmutableUtils";

export const addStartingOffset = (telemetries = []) => {
    if (find(telemetries, t => t.time)) {
        let firstTime = head(telemetries).time;
        firstTime = new Date(firstTime);
        return telemetries.map(t => {
            return {...t, startingOffset: new Date(t.time).getTime() - firstTime};
        });
    } return [];
};

export const getAdditionalLayerAction = ({feature, id, name, style = null}) => {
    if (!feature) {
        return removeAdditionalLayer({id});
    }
    const layerOptions = {
        id,
        name,
        style: style,
        type: "vector",
        visibility: true,
        features: [feature]
    };
    return updateAdditionalLayer(id, "sciadro", "overlay", layerOptions);
};

export const getStyleFromType = (type = "LineString") => {
    const styles = {
        "LineString": {
            color: "#FF0000",
            weight: 3
        },
        "Point": {
            iconColor: "orange",
            iconShape: "circle",
            iconGlyph: "comment"
        },
        "Marker": {
            iconColor: "orange",
            iconShape: "circle",
            iconGlyph: "comment"
        }
    };
    return styles[type];
};

/**
 *  @param {object[]} telemetries record items related to the drone
 *  @param {number} timePlayedMS ms passed since the start of the video
 *  @param {number} interval ms time interval beteen the player check for updates on the telemetry
 *  @return {string} the telemetry object
*/
export const getTelemetryByTimePlayed = (telemetries = [], timePlayedMS = 0, interval = 500) => {
    const closestTelem = telemetries.filter(t => {
        return (Math.abs(t.startingOffset - timePlayedMS) / interval) < 1;
    }) || {};
    if (closestTelem.length === 0) {
        return last(telemetries);
    }
    return head(closestTelem);
};

export const getValidationState = (val) => {
    return !!val ? "success" : "warning";
};

export const getValidationFiles = (mission = {}) => {
    if (mission.isNew) {
        return mission.files ? "success" : "warning";
    }
    return "success";
};

export const isEditedItemValid = (type, item) => {
    switch (type) {
        case "asset": return !!item.name && !!item.attributes && !!item.attributes.type;
        case "mission": return !!item.name && !!item.files;
        default: return false;
    }
};

export const removeAdditionalLayerById = (id) => {
    return removeAdditionalLayer({id});
};

export const resetProps = (items = [], propsToReset = ["selected", "current"]) => {
    const props = propsToReset.reduce((p, c) => ({...p, [c]: false}), {});
    return items.map( item => ({...item, ...props}));
};

// reset prop passed for all items but toggle provided one
export const toggleItemsProp = (items = [], id, prop = "selected") => {
    let newItems = [...items];
    const selectedItemIndex = findIndex(items, item => item.id === id);
    if (selectedItemIndex !== -1) {
        newItems = newItems.map((m, index) => ({...m, [prop]: index !== selectedItemIndex ? false : !m[prop]}));
    }
    return newItems;
};

export const updateDrone = (items = [], id, props = {}, geometry = {}, style = {
    iconUrl: "/assets/images/drone-nord.svg",
    size: [24, 24],
    iconAnchor: [0.5, 0.5]
}) => {
    let newItems = [...items];
    const selectedItemIndex = findIndex(items, item => item.id === id);
    if (selectedItemIndex !== -1) {
        const currentItem = newItems[selectedItemIndex];
        newItems = set(`[${selectedItemIndex}].drone.properties`, {...(currentItem.drone && currentItem.drone.properties || {}), ...props}, newItems);
        newItems = set(`[${selectedItemIndex}].drone.geometry`, {...(currentItem.drone && currentItem.drone.geometry || {}), ...geometry}, newItems);
        newItems = set(`[${selectedItemIndex}].drone.style`, {...(currentItem.drone && currentItem.drone.style || {}), ...style}, newItems);
        newItems = set(`[${selectedItemIndex}].drone.type`, "Feature", newItems);
    }
    return newItems;
};

export const updateItem = (items = [], condition, props = {}) => {
    let newItems = [...items];
    const itemIndex = findIndex(items, condition);
    if (itemIndex !== -1) {
        newItems[itemIndex] = {...newItems[itemIndex], ...props};
    }
    return newItems;
};

export const updateItemAndResetOthers = ({items = "assets", id, state, propsToUpdate = {selected: true, current: true }, propsToReset = ["selected", "current"]}) => {
    return {
        ...state,
        [items]: updateItem(resetProps(state[items], propsToReset), {id}, propsToUpdate)
    };
};
