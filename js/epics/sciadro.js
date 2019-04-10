/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {LOAD_ASSETS, SELECT_MISSION, loadedAssets, loadAssetError} from '../actions/sciadro';
import {selectedMissionSelector} from '../selectors/sciadro';
import GeoStoreApi from "@mapstore/api/GeoStoreDAO";
import {updateAdditionalLayer} from "@mapstore/actions/additionallayers";
import * as Persistence from "@mapstore/api/persistence";

const mockAssetsGeojson = [{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [9, 45]
    }
},
{
    type: "Feature",
    geometry: {
        type: "LineString",
        coordinates: [[9, 44], [4, 44]]
    }
},
{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [9, 42]
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
                return Rx.Observable.empty();
            })
            .combineAll()
            .switchMap((assets = []) => {
                // adding a fake asset geom and a fake mission to each asset
                const assetWithMission = assets.map((a, i) => ({ ...a, feature: mockAssetsGeojson[i], missionsId: [1]}));
                return Rx.Observable.of(loadedAssets(assetWithMission));
            })
            .catch((e) => loadAssetError(e));
        });


/**
 * Intercept on `SELECT_MISSION` to show in the map the mission's feature
 * @param {external:Observable} action$ manages `SELECT_MISSION`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const highlightMissionEpic = (action$, store) =>
    action$.ofType(SELECT_MISSION)
        .switchMap(() => {
            const state = store.getState();

            const mission = selectedMissionSelector(state);
            const layerOptions = {
                id: "missions",
                name: "missions",
                type: "vector",
                visibility: true,
                features: [mission.feature],
                style: {
                    color: "#FF0000",
                    weight: 3
                }
            };
            return Rx.Observable.of(updateAdditionalLayer("missions", "sciadro", "overlay", layerOptions));
        });
