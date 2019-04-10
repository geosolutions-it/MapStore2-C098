/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import * as Rx from 'rxjs';
// import axios from 'axios';
import { LOAD_ASSETS, loadedAssets, loadAssetError } from '../actions/sciadro';
import GeoStoreApi from "../../MapStore2/web/client/api/GeoStoreDAO";
import * as Persistence from "../../MapStore2/web/client/api/persistence";

/**
 * it removes the attributes
 * @param {object} res the resource to parse
 * @return {object} the asset object
*//*
const resourceIntoAsset = ({attributes, ...res}) => {
    return {
        ...res,
        ...attributes
    };
};*/

const mockAssetsGeojson = [{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [45, 9]
    }
},
{
    type: "Feature",
    geometry: {
        type: "LineString",
        coordinates: [[44, 9], [44, 4]]
    }
},
{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [42, 9]
    }
}];

/**
 * Intercept on `LOAD_ASSETS` to get assets Resources
 * @param {external:Observable} action$ manages `LOAD_ASSETS`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const loadAssetsEpic = (action$) =>
    action$.ofType(LOAD_ASSETS)
        .switchMap(() => {
            // get all assets
            return Rx.Observable.fromPromise(
                GeoStoreApi.getResourcesByCategory("ASSET").then(data => data)
            )
            .switchMap(({results = []}) => {
                if (results.length) {
                    // observable object that will retrieve all the info of the reosurces
                    const getResourcesObs = results.map(({id}) => {
                        return Persistence.getResource(id).catch((e) => loadAssetError(e));
                    });
                    return getResourcesObs;
                }
                return Rx.Observable.of(loadedAssets([]));
            })
            .combineAll()
            .switchMap((assets) => {
                // adding a fake asset geom and a fake mission to each asset
                const assetWithMission = assets.map((a, i) => ({ ...a, feature: mockAssetsGeojson[i], missionsId: [1]}));
                return Rx.Observable.of(loadedAssets(assetWithMission));
            })
            .catch((e) => loadAssetError(e));
        });
