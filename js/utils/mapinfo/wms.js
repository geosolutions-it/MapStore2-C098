/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isObject, isNil} from 'lodash';
import assign from 'object-assign';

import {getCurrentResolution} from '@mapstore/utils/MapUtils';
import {reproject, getProjectedBBox, normalizeSRS} from '@mapstore/utils/CoordinatesUtils';
import { optionsToVendorParams } from '@mapstore/utils/VendorParamsUtils';
import { generateEnvString } from '@mapstore/utils/LayerLocalizationUtils';
import {addAuthenticationToSLD} from '@mapstore/utils/SecurityUtils';

import {getLayerUrl} from '@js/utils/LayersUtils';

export default {
    /**
     * Creates the request object and it's metadata for WMS GetFeatureInfo.
     * @param {object} layer
     * @param {object} options
     * @param {string} infoFormat
     * @param {string} viewer
     * @return {object} an object with `request`, containing request paarams, `metadata` with some info about the layer and the request, and `url` to send the request to.
     */
    buildRequest: (layer, { sizeBBox, map = {}, point, currentLocale, params: defaultParams, maxItems = 10, env } = {}, infoFormat, viewer, gfiOptions = {}) => {
        /* In order to create a valid feature info request
         * we create a bbox of 101x101 pixel that wrap the point.
         * center point is re-projected then is built a box of 101x101pixel around it
         */
        const heightBBox = sizeBBox && sizeBBox.height || 101;
        const widthBBox = sizeBBox && sizeBBox.width || 101;
        const size = [heightBBox, widthBBox];
        const rotation = 0;
        const resolution = isNil(map.resolution)
            ? getCurrentResolution(Math.ceil(map.zoom), 0, 21, 96)
            : map.resolution;
        let wrongLng = point.latlng.lng;
        // longitude restricted to the [-180°,+180°] range
        let lngCorrected = wrongLng - 360 * Math.floor(wrongLng / 360 + 0.5);
        const center = {x: lngCorrected, y: point.latlng.lat};
        let centerProjected = reproject(center, 'EPSG:4326', map.projection);
        let bounds = getProjectedBBox(centerProjected, resolution, rotation, size, null);
        let queryLayers = layer.name;
        if (layer.queryLayers) {
            queryLayers = layer.queryLayers.join(",");
        }

        const ENV = generateEnvString(env);
        const params = optionsToVendorParams({
            layerFilter: layer.layerFilter,
            filterObj: layer.filterObj,
            params: assign({}, layer.baseParams, layer.params, defaultParams)
        });
        return {
            request: addAuthenticationToSLD({
                service: 'WMS',
                version: '1.1.1',
                request: 'GetFeatureInfo',
                exceptions: 'application/json',
                id: layer.id,
                layers: layer.name,
                query_layers: queryLayers,
                styles: layer.style,
                x: widthBBox % 2 === 1 ? Math.ceil(widthBBox / 2) : widthBBox / 2,
                y: widthBBox % 2 === 1 ? Math.ceil(widthBBox / 2) : widthBBox / 2,
                height: heightBBox,
                width: widthBBox,
                srs: normalizeSRS(map.projection) || 'EPSG:4326',
                bbox: bounds.minx + "," +
                      bounds.miny + "," +
                      bounds.maxx + "," +
                      bounds.maxy,
                feature_count: maxItems,
                info_format: infoFormat,
                ENV,
                ...assign({}, params)
            }, layer),
            metadata: {
                title: isObject(layer.title) ? layer.title[currentLocale] || layer.title.default : layer.title,
                regex: layer.featureInfoRegex,
                viewer,
                featureInfo: gfiOptions.featureInfo,
                mapTip: gfiOptions.mapTip
            },
            url: getLayerUrl(layer).replace(/[?].*$/g, '')
        };
    }
};
