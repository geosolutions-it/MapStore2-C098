/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {updateAdditionalLayer, removeAdditionalLayer} from "@mapstore/actions/additionallayers";
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

export const removeAdditionalLayerById = (id) => {
    return removeAdditionalLayer({id});
};

export const getValidationState = (val) => {
    return !!val ? "success" : "warning";
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
 used to mock some axios req/res for sciadro backend
*/
const MockAdapter = require("axios-mock-adapter");
const axios = require("@mapstore/libs/ajax");

const DATA = {
    POST_ASSET: require("json-loader!@js/test-resources/postAsset.json"),
    GET_ALL_ASSETS: require("json-loader!@js/test-resources/getAllAssets.json")
};


export const postAssetResource = ({backendUrl = "http://localhost:8000", resource = {}, options = {
    timeout: 3000,
    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
}} = {}) => {
    let mockAxios = new MockAdapter(axios);
    mockAxios.onPost(/assets/).reply(201, DATA.POST_ASSET);
    return axios.post(`${backendUrl}/assets`, resource, options)
        .then(data => {
            mockAxios.reset();
            mockAxios.restore();
            return data;
        });
};

export const updateItem = (items = [], id, props = {}) => {
    let newItems = [...items];
    const itemIndex = findIndex(items, item => item.id === id);
    if (itemIndex !== -1) {
        newItems[itemIndex] = {...newItems[itemIndex], ...props};
    }
    return newItems;
};

// reset prop passed for all items but toggle provided one
export const toggleItemsProps = (items = [], id, prop = "selected") => {
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

export const resetProps = (items = [], propsToReset = ["selected", "current"]) => {
    const props = propsToReset.reduce((p, c) => ({...p, [c]: false}), {});
    return items.map( item => ({...item, ...props}));
};

export const updateItemAndResetOthers = ({items = "assets", id, state, propsToUpdate = {selected: true, current: true }, propsToReset = ["selected", "current"]}) => {
    return {
        ...state,
        [items]: updateItem(resetProps(state[items], propsToReset), id, propsToUpdate)
    };
};

export const isEditedItemValid = (type, item) => {
    switch (type) {
        case "asset": return !!item.name && !!item.type;
        case "mission": return !!item.name;
        default: return false;
    }
};
