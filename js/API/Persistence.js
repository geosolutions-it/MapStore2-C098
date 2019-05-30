/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {isNil} from 'lodash';
import {
    saveSciadroServerError,
    saveGeostoreError,
    saveError
} from '@js/actions/sciadro';

const axios = require("@mapstore/libs/ajax");
import * as Persistence from "@mapstore/api/persistence/index";

const DATA = {
    DELETE_ASSET: require("json-loader!@js/test-resources/deleteAsset.json"),
    GET_FRAME_IMAGE: require("@js/test-resources/frame16.png"),
    POST_ASSET: require("json-loader!@js/test-resources/postAsset.json"),
    GET_ASSET: require("json-loader!@js/test-resources/getAsset.json"),
    POST_MISSION: require("json-loader!@js/test-resources/postMission.json"),
    GET_MISSION: require("json-loader!@js/test-resources/getMission.json"),
    GET_ALL_ASSETS: require("json-loader!@js/test-resources/getAllAssets.json")
};

export const deleteResourceSciadroServer = ({id, path = "assets", backendUrl = "http://localhost:8000", options = {
    timeout: 3000,
    headers: {'Accept': 'application/json'}
}} = {}) => {
    return axios.delete(`${backendUrl}/${path}/${id}`, options).then(data => data);
};

const postResourceSciadro = ({blob, path, backendUrl, resource, options} = {}) => {
    const fd = new FormData();
    if (blob) {
        fd.append('file', blob);
    }
    Object.keys(resource).forEach(key => {
        if (!isNil(resource[key])) {
            if (key === "feature") {
                fd.append("geometry", JSON.stringify(resource[key].geometry, null, 0));
            } else if (key === "type") {
                fd.append("type", "PIP");
            } else {
                fd.append(key, resource[key]);
            }
        }
    });
    return axios.post(`${backendUrl}/${path}`, fd, options).then(data => data);
};

export const createResourceSciadroServer = ({path = "assets/", backendUrl = "http://localhost:8000", category, resource = {}, fileUrl, options = {
    timeout: 30000,
    headers: {
        "Accept": "application/json",
        "Content-Type": 'multipart/form-data'
    }
}} = {}) => {

    // guard to prevent cretion of a mission without zip file
    if (!fileUrl && category === "MISSION") {
        return null;
    }
    // if not file and is asset just do the post request
    if (!fileUrl && category === "ASSET") {
        return postResourceSciadro({path, backendUrl, resource, options});
    }
    return fetch(fileUrl)
    .then(res => res.blob())
    .then((blob) => postResourceSciadro({blob, path, backendUrl, resource, options}));
};

// return a defer
const createResourceGeostoreCallBack = (metadata, category, configuredPermission) => {
    return Persistence.createResource({
        metadata,
        category,
        configuredPermission
    });
};

const manageCreationResourceGeostore = (metadata, category, configuredPermission) => {
    return createResourceGeostoreCallBack(metadata, category, configuredPermission)
    .catch( (e) => {
        if (e.status === 409) {
            /*
             * geostore resource duplicated
             * retry creation with the name suggested by geostore
            */
            return createResourceGeostoreCallBack({...metadata, name: e.data || metadata.name + " - 2"}, category, configuredPermission)
                .catch(() => {
                    // if an error occur on retry => reset the whole process
                    return Rx.Observable.of(null);
                });
        }
        // if an error occur on creation => reset the whole process
        return Rx.Observable.of(null);
    });
};


/**
 * it manages the save flow for the creationf of resources and file upload
 * for both backends with error handling
 * @param {object} resource form attributes to save
 * @param {string} category of the resource (ASSET || MISSION)
 * @param {object} resourcePermissions for the geostore resource
 * @param {function} postProcessActions actions to dispatch after the whole process is successfull
 * @param {boolean} updateAssetAttribute if a request must be sent to update asset attribute with updated mission list
 * @param {function} errorsActions actions to dispatch in case of error
 * @param {string} fileUrl optional file to upload. Required only for MISSION resources
 * @return observable actions
*/
export const saveResource = ({resource = {}, category, resourcePermissions = {}, postProcessActions = () => [], errorsActions = () => [], fileUrl, path, updateAssetAttribute = false, backendUrl} = {}) =>
    Rx.Observable.defer( () =>
        createResourceSciadroServer({resource, fileUrl, category, path, backendUrl})
            .then(res => {
                if (res === null) {
                    // TEST THIS
                    return {status: 500};
                }
                return res;
            })
            .catch(() => {
                // TEST THIS
                return {status: 500};
            })
    )
    .switchMap(({status, data: sciadroData} = {}) => {
        if (status === 201) {
            const sciadroResourceId = sciadroData.id;
            let otherAttributes = {};
            if (category === "ASSET") {
                otherAttributes = {
                    missions: sciadroData.missions.join(","),
                    type: resource.type
                };
            } else if (category === "MISSION") {
                otherAttributes = {
                    anomalies: ""
                };
            }
            let metadata = {
                name: resource.name,
                description: resource.description,
                attributes: {
                    sciadroResourceId: sciadroData.id,
                    created: sciadroData.created,
                    modified: sciadroData.modified,
                    note: resource.note,
                    ...otherAttributes
                }
            };
            return Rx.Observable.defer( () => manageCreationResourceGeostore(metadata, category, resourcePermissions))
                .switchMap((idResourceGeostore) => {
                    if (!idResourceGeostore) {
                        // fall back, delete resource already created on sciadro backend
                        // TEST DELETE OF MISSION
                        return Rx.Observable.defer( () => deleteResourceSciadroServer({id: sciadroResourceId, path: `${path}/${sciadroResourceId}`}))
                            .switchMap(() => {
                                return Rx.Observable.from([
                                        saveError(resource.id, "sciadro.rest.saveError"),
                                        saveGeostoreError({message: "sciadro.rest.saveError"})
                                    ]);
                            });
                    }
                    if (updateAssetAttribute) {
                        return Rx.Observable.defer( () => Persistence.updateResourceAttribute({id: resource.assetId, name: "missions", value: resource.missions ? `${resource.missions},${idResourceGeostore}` : `${idResourceGeostore}`}))
                        .switchMap(() => {
                            return Rx.Observable.from(postProcessActions(sciadroData, idResourceGeostore));
                        });
                    }
                    return Rx.Observable.from(postProcessActions(sciadroData, idResourceGeostore));
                });
        }
        return Rx.Observable.from([...(errorsActions(resource.id)), saveSciadroServerError()]);
    });


export const getResourceSciadroServer = ({path = "assets", backendUrl = "http://localhost:8081", options = {
    timeout: 3000,
    headers: {'Accept': 'application/json,image/png', 'Content-Type': 'application/json' }
}} = {}) => {
    const url = `${backendUrl}/${path}`;
    return axios.get(url, options)
        .then(res => (res));
};

/**
* it fetches the feature geojson from sciadro backend from asset
* @param {string} id of the resource to fetch
* @param {function} postProcessActions actions to dispatch after the whole process is successfull
* @param {function} errorsActions actions to dispatch in case of error
* @return
*/
export const getAssetResource = ({id, postProcessActions = () => [], errorsActions = () => [], backendUrl} = {}) => {
    return Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${id}`}))
        .switchMap((result) => {
            return Rx.Observable.from(postProcessActions(result.data));
        })
        .catch(() => {
            return Rx.Observable.from(errorsActions()); // error on sciadro backend
        });
};

/**
* it fetches the feature geojson from sciadro backend from mission
* @param {string} id of the resource to fetch
* @param {function} postProcessActions actions to dispatch after the whole process is successfull
* @param {function} errorsActions actions to dispatch in case of error
* @return
*/
export const getMissionResource = ({id, assetId, postProcessActions = () => [], errorsActions = () => [], backendUrl} = {}) => {
    return Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${id}`}))
        .switchMap((result) => {
            return Rx.Observable.from(postProcessActions(result.data));
        })
        .catch(() => {
            return Rx.Observable.from(errorsActions()); // error on sciadro backend
        });
};

const parseSciadroResponse = res => res.data && res.data.results || res.data;

export const getMissionData = ({missionId, assetId, backendUrl} = {}) =>
    Rx.Observable.forkJoin([
        Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${missionId}/frames`}).then(parseSciadroResponse)),
        Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${missionId}/telemetry`}).then(parseSciadroResponse)),
        Rx.Observable.defer( () =>
            getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${missionId}/video`}).then(parseSciadroResponse).catch(() => ({})))
    ])
    .map(([frames, telemetries, video]) => ({ frames, telemetries, video }));


/**
* it fetches the image for the frameId specified
* @param {string} assetId id of the asset which the frameId belongs
* @param {string} missionId id of the mission which the frameId belongs
* @param {string} frameId id of the frame
* @param {string} backendUrl url to the backend server
* @return {object} image.png
*/
export const getFrameImage = ({missionId, assetId, backendUrl, frameId} = {}) => {
    // TODO remove mockaxios when the issue #5 is fixed
    /*
    const MockAdapter = require("axios-mock-adapter");
    let mockAxios = new MockAdapter(axios, {delayResponse: 100});
    mockAxios.onGet(/objects/).reply(200, DATA.GET_FRAME_IMAGE);
    */
    return Rx.Observable.defer( () => getResourceSciadroServer({
        backendUrl,
        path: `assets/${assetId}/missions/${missionId}/objects/${frameId}`,
        options: {
            headers: {'Accept': 'image/png', 'Content-Type': 'image/png' }
        }}))
        .switchMap((res) => {
            /*
            mockAxios.reset();
            mockAxios.restore();
            */
            return Rx.Observable.of(res);
        });
};
