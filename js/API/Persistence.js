/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
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
    POST_MISSION: require("json-loader!@js/test-resources/postMission.json"),
    GET_ALL_ASSETS: require("json-loader!@js/test-resources/getAllAssets.json")
};

export const deleteResourceSciadroServer = ({id, path = "assets", backendUrl = "http://localhost:8000", options = {
    timeout: 3000,
    headers: {'Accept': 'application/json'}
}} = {}) => {
    let mockAxios = new MockAdapter(axios);
    mockAxios.onDelete(/assets/).reply(200, DATA.DELETE_ASSET);
    return axios.delete(`${backendUrl}/${path}/${id}`, options)
        .then(data => {
            mockAxios.reset();
            mockAxios.restore();
            return data;
        });
};

const createResourceSciadro = ({mockAxios, blob, path, backendUrl, resource, options}) => {
    const fd = new FormData();
    if (blob) {
        fd.append('file', blob);
    }
    Object.keys(resource).forEach(key => fd.append(key, resource[key]));
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
        return createResourceSciadro({mockAxios, path, backendUrl, resource, options});
    }
    if (!fileUrl && category === "MISSION") {
        return null;
    }
    return fetch(fileUrl)
    .then(res => res.blob())
    .then((blob) => createResourceSciadro({mockAxios, blob, path, backendUrl, resource, options}));
};

// return a defer
const createResourceGeostoreCallBack = (metadata, category, configuredPermission) =>
    Persistence.createResource({
        metadata,
        category,
        configuredPermission
    });

const manageCreationResourceGeostore = (metadata, category, configuredPermission) =>
        createResourceGeostoreCallBack(metadata, category, configuredPermission)
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


/**
 * it manages the save flow for the creationf of resources and file upload
 * for both backends with error handling
 * @param {object} resource form attributes to save
 * @param {string} category of the resource (ASSET || MISSION)
 * @param {object} resourcePermissions for the geostore resource
 * @param {function[]} postProcessActions actions to launch afte the whole proces is succesfull
 * @param {string} fileUrl optional file to upload. Required only for MISSION resources
*/
export const saveResource = ({resource = {}, category, resourcePermissions = {}, postProcessActions = [], fileUrl} = {}) =>
    Rx.Observable.defer( () =>
        createResourceSciadroServer({resource, fileUrl, category})
            .then(res => {
                if (res === null) {
                    return Rx.Observable.of(saveSciadroServerError()); // error on sciadro backend
                    // TODO use this return Rx.Observable.of(saveFileSciadroServerError(e)); // error on sciadro backend
                }
                return res;
            })
            .catch((e) => {
                return Rx.Observable.of(saveSciadroServerError(e)); // error on sciadro backend
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
            return manageCreationResourceGeostore(metadata, category, resourcePermissions)
            .switchMap((idResourceGeostore) => {
                if (!idResourceGeostore) {
                    // fall back, delete resource already created on sciadro
                    return Rx.Observable.defer(
                        deleteResourceSciadroServer({id: sciadroResourceId})
                    ).switchMap(() => {
                        return Rx.Observable.from([
                                saveError({message: "sciadro.rest.save.error"}),
                                saveGeostoreError({message: "sciadro.rest.save.error"})
                            ]);
                    });
                }
                return Rx.Observable.from(postProcessActions(sciadroData, idResourceGeostore));
            });
        }
        return Rx.Observable.of(saveSciadroServerError());
    });
