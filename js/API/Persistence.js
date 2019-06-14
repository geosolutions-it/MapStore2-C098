/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {isNil, includes} from 'lodash';
import {
    saveSciadroServerError,
    saveGeostoreError,
    saveError
} from '@js/actions/sciadro';

const axios = require("@mapstore/libs/ajax");
import * as Persistence from "@mapstore/api/persistence/index";

export const deleteResourceSciadroServer = ({id, path = "assets", backendUrl = "http://localhost:8000", options = {
    timeout: 3000,
    headers: {'Accept': 'application/json'}
}} = {}) => {
    return axios.delete(`${backendUrl}/${path}/${id}`, options).then(data => data);
};

const postResourceSciadro = ({blob, path, backendUrl, resource, options, isNew = false} = {}) => {
    const fd = new FormData();
    if (blob) {
        fd.append('mission_file.mission_file', blob, "file.zip");
    }
    const notAllowedProperties = ["id"];
    Object.keys(resource).forEach(key => {
        if (!isNil(resource[key]) && !includes(notAllowedProperties)) {
            if (key === "feature") {
                fd.append("geometry", JSON.stringify(resource[key].geometry, null, 0));
            } else {
                fd.append(key, resource[key]);
            }
        }
    });
    let axiosMethod = isNew ? axios.post : axios.put;
    return axiosMethod(`${backendUrl}/${path}`, fd, options).then(data => data);
};

export const createResourceSciadroServer = ({
    path = "assets/",
    backendUrl = "http://localhost:8000",
    category,
    resource = {},
    fileUrl,
    isNew = false,
    options = {
        timeout: 80000,
        headers: {
            "Accept": "application/json",
            "Content-Type": 'multipart/form-data'
        }
    }
} = {}) => {

    // guard to prevent cretion of a mission without zip file
    if (!fileUrl && isNew && category === "MISSION") {
        return null;
    }
    // if not file just do the put/post request
    if (!fileUrl) {
        return postResourceSciadro({path, backendUrl, resource, options, isNew});
    }
    return fetch(fileUrl)
    .then(res => res.blob())
    .then((blob) => postResourceSciadro({blob, path, backendUrl, resource, options, isNew}));
};

// return a defer
const createResourceGeostoreCallBack = (metadata, category, permission) => {
    return Persistence.createResource({
        metadata,
        category,
        permission
    });
};

const manageCreationResourceGeostore = (metadata, category, configuredPermission, id, isNew = false) => {
    return isNew ? createResourceGeostoreCallBack(metadata, category, configuredPermission)
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
    }) : Persistence.updateResource({id, metadata, permission: configuredPermission});
};


/**
 * it manages the saving flow for the creationf of resources and file upload
 * for both backends with error handling
 * @param {object} resource form attributes to save
 * @param {string} category of the resource (ASSET || MISSION)
 * @param {object} resourcePermissions for the geostore resource
 * @param {function} postProcessActions actions to dispatch after the whole process is successfull
 * @param {string} assetId the asset id on siadro backend
 * @param {function} errorsActions actions to dispatch in case of error
 * @param {string} fileUrl optional file to upload. Required only for MISSION resources
 * @return observable actions
*/
export const saveResource = ({
    resource = {},
    category,
    resourcePermissions = {},
    postProcessActions = () => [],
    errorsActions = () => [],
    fileUrl,
    isNew = false,
    path,
    otherAttributes = () => {},
    backendUrl} = {}) =>
    Rx.Observable.defer( () =>
        createResourceSciadroServer({resource, fileUrl, category, path, backendUrl, isNew})
            .then(res => {
                if (res === null) {
                    // TEST THIS
                    return {status: 500};
                }
                if (category === "MISSION") {
                    return {...res, data: res.data.created};
                }
                return res;
            })
            .catch((e) => {
                // TEST THIS
                return e;
            })
    )
    .switchMap(({status, data: sciadroData} = {}) => {
        if (status === 201 || status === 200) {
            const sciadroResourceId = sciadroData.id;
            let metadata = {
                name: sciadroData.name,
                description: sciadroData.description,
                attributes: {
                    sciadroResourceId: sciadroData.id,
                    created: sciadroData.created,
                    modified: sciadroData.modified,
                    note: sciadroData.note,
                    ...otherAttributes(sciadroData)
                }
            };
            return Rx.Observable.defer( () => manageCreationResourceGeostore(metadata, category, resourcePermissions, resource.id, isNew))
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
        Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${missionId}/frames/?page_size=1000`}).then(parseSciadroResponse)),
        Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${missionId}/telemetry`}).then(parseSciadroResponse)),
        Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${missionId}/video`}).then(parseSciadroResponse).catch(() => ({}))),
        Rx.Observable.defer( () => getResourceSciadroServer({backendUrl, path: `assets/${assetId}/missions/${missionId}/anomalies/?page_size=1000`}).then(parseSciadroResponse))
    ])
    .map(([frames, telemetries, video, anomalies]) => ({ frames, telemetries, video, anomalies }));


/**
* it fetches the image for the frameId specified
* @param {string} assetId id of the asset which the frameId belongs
* @param {string} backendUrl url to the backend server
* @param {string} frameId id of the frame
* @param {string} missionId id of the mission which the frameId belongs
* @return {object} image.png
*/
export const getFrameImage = ({assetId, backendUrl, frameId, missionId} = {}) => {
    // TODO when the issue #5 is fixed, then check this is working
    return Rx.Observable.defer(
        () => getResourceSciadroServer({
            backendUrl,
            path: `assets/${assetId}/missions/${missionId}/objects/${frameId}`,
            options: {
                headers: {'Accept': 'image/png', 'Content-Type': 'image/png' }
            }
        })
    )
    .switchMap((res) => {
        return Rx.Observable.of(res);
    });
};
