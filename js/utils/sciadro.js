/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {updateAdditionalLayer, removeAdditionalLayer} from "@mapstore/actions/additionallayers";

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
