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


/**
 used to mock some axios req/res for sciadro backend
*/
const MockAdapter = require("axios-mock-adapter");
const axios = require("@mapstore/libs/ajax");
import * as Persistence from "@mapstore/api/persistence/index";

const DATA = {
    DELETE_ASSET: require("json-loader!@js/test-resources/deleteAsset.json"),
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
    /*
     * let mockAxios = new MockAdapter(axios);
     * mockAxios.onDelete(/assets/).reply(200, DATA.DELETE_ASSET);
    */
    return axios.delete(`${backendUrl}/${path}/${id}`, options)
        .then(data => {
            /*
            mockAxios.reset();
            mockAxios.restore();
            */
            return data;
        });
};

/*
 * TODO remove mockaxios
*/
const postResourceSciadro = ({mockAxios, blob, path, backendUrl, resource, options}) => {
    const fd = new FormData();
    if (blob) {
        fd.append('file', blob);
    }
    Object.keys(resource).forEach(key => {
        if (!isNil(resource[key])) {
            fd.append(key, resource[key]);
        }
    });
    return axios.post(`${backendUrl}/${path}`, fd, options)
        .then(data => {
            mockAxios.reset();
            mockAxios.restore();
            return data;
        });
};

export const createResourceSciadroServer = ({path = "assets", backendUrl = "http://localhost:8000", category, resource = {}, fileUrl, options = {
    timeout: 3000,
    headers: {'Accept': 'application/json'}
}} = {}) => {
    let mockAxios = new MockAdapter(axios);
    mockAxios.onPost(/assets/).reply(201, DATA.POST_ASSET);
    mockAxios.onPost(/assets\/[\w]*\/missions/).reply(201, DATA.POST_MISSION);

    if (!fileUrl) {
        return postResourceSciadro({mockAxios, path, backendUrl, resource, options});
    }
    if (!fileUrl && category === "MISSION") {
        return null;
    }
    return fetch(fileUrl)
    .then(res => res.blob())
    .then((blob) => postResourceSciadro({mockAxios, blob, path, backendUrl, resource, options}));
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
 * @param {function} postProcessActions actions to dispatch after the whole process is succesfull
 * @param {function} errorsActions actions to dispatch in case of error
 * @param {string} fileUrl optional file to upload. Required only for MISSION resources
 * @return observable actions
*/
export const saveResource = ({resource = {}, category, resourcePermissions = {}, postProcessActions = [], errorsActions = [], fileUrl} = {}) =>
    Rx.Observable.defer( () =>
        createResourceSciadroServer({resource, fileUrl, category})
            .then(res => {
                if (res === null) {
                    return Rx.Observable.from([...(errorsActions(resource.id)), saveSciadroServerError()]); // error on sciadro backend
                    // TODO use this return Rx.Observable.from([...errorsActions, saveFileSciadroServerError(e)]); // error on sciadro backend
                }
                return res;
            })
            .catch((e) => {
                return Rx.Observable.from([...(errorsActions(resource.id, e.message)), saveSciadroServerError()]); // error on sciadro backend
            })
    )
    .switchMap(({status, data: sciadroData} = {}) => {
        if (status === 201) {
            const sciadroResourceId = sciadroData.id;
            let otherAttributes = {};
            if (category === "ASSET") {
                otherAttributes = {
                    missionsId: sciadroData.missions.join(","),
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
            /*let mockAxios = new MockAdapter(axios);
            mockAxios.onPost(/resources/).reply(409, metadata.name + " - 2");*/
            return Rx.Observable.defer( () => manageCreationResourceGeostore(metadata, category, resourcePermissions))
                .switchMap((idResourceGeostore) => {
                    /*mockAxios.reset();
                    mockAxios.restore();*/
                    if (!idResourceGeostore) {
                        // fall back, delete resource already created on sciadro backend
                        return Rx.Observable.defer( () => deleteResourceSciadroServer({id: sciadroResourceId}))
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


export const getAssetResourceSciadroServer = ({path = "assets", backendUrl = "http://localhost:8000", id, options = {
    timeout: 3000,
    headers: {'Accept': 'application/json', 'Content-Type': 'application/json' }
}} = {}) => {
    let mockAxios = new MockAdapter(axios, {delayResponse: 1000});
    mockAxios.onGet(/assets/).reply(200, DATA.GET_ASSET);
    mockAxios.onGet(/assets\/[\w-]*/).reply(200, DATA.GET_ASSET);
    mockAxios.onGet(/assets\/[\w-]*\/missions/).reply(200, DATA.GET_MISSION);
    const url = `${backendUrl}/${path}/${id}`;
    return axios.get(url, options)
        .then(res => {
            mockAxios.reset();
            mockAxios.restore();
            return res;
        });
};

/**
* it fetches the feature geojson from sciadro backend
* @param {string} id of the resource to fetch
* @param {function} postProcessActions actions to dispatch after the whole process is succesfull
* @param {function} errorsActions actions to dispatch in case of error
* @return
*/
export const getAssetResource = ({id, postProcessActions, errorsActions}) => {
    return Rx.Observable.defer( () => getAssetResourceSciadroServer({id}))
        .switchMap((result) => {
            return Rx.Observable.from(postProcessActions(result.data));
        })
        .catch((e) => {
            console.log(e);
            return Rx.Observable.from([...(errorsActions())]); // error on sciadro backend
        });
};
