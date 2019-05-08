/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { updateAdditionalLayer, removeAdditionalLayer } from "@mapstore/actions/additionallayers";
import { findIndex } from "lodash";
import { set } from "@mapstore/utils/ImmutableUtils";

export const getAdditionalLayerAction = ({feature, id, name, style = { color: "#FF0000", weight: 3 }}) => {
    if (!feature) {
        return removeAdditionalLayer({id});
    }
    const layerOptions = {
        id,
        name,
        style,
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

export const updateDroneProps = (items = [], id, props = {}) => {
    let newItems = [...items];
    const selectedItemIndex = findIndex(items, item => item.id === id);
    if (selectedItemIndex !== -1) {
        const currentItem = newItems[selectedItemIndex];
        newItems = set(`[${selectedItemIndex}].drone.properties`, {...(currentItem.drone && currentItem.drone.properties || {}), ...props}, newItems);
    }
    return newItems;
};

export const updateItemById = (items = [], id, props = {}) => {
    let newItems = [...items];
    const itemIndex = findIndex(items, item => item.id === id);
    if (itemIndex !== -1) {
        newItems[itemIndex] = {...newItems[itemIndex], ...props};
    }
    return newItems;
};

export const updateItemAndResetOthers = ({items = "assets", id, state, propsToUpdate = {selected: true, current: true }, propsToReset = ["selected", "current"]}) => {
    return {
        ...state,
        [items]: updateItemById(resetProps(state[items], propsToReset), id, propsToUpdate)
    };
};
