/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {includes, head} from 'lodash';
import {
    addFeatureAsset,
    changeCurrentAsset,
    downloadFrame,
    drawAsset,
    hideAdditionalLayer,
    resetCurrentAsset,
    resetCurrentMission,
    selectMission,
    selectAsset,
    startLoadingAssets,
    startSavingAsset,
    updateDroneGeometry,
    zoomToItem,
    CHANGE_MODE,
    DOWNLOADING_FRAME,
    LOADING_ASSETS,
    LOADING_ASSET_FEATURE,
    LOADED_ASSETS,
    LOADING_MISSIONS,
    LOADING_MISSION_FEATURE,
    LOADED_MISSIONS,
    UPDATE_ASSET,
    UPDATE_MISSION,
    ZOOM_TO_ITEM
} from "@js/actions/sciadro";
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import { SHOW_NOTIFICATION } from "@mapstore/actions/notifications";
import { CHANGE_DRAWING_STATUS } from "@mapstore/actions/draw";
import { ZOOM_TO_POINT, ZOOM_TO_EXTENT } from "@mapstore/actions/map";
import { ON_SHAPE_SUCCESS } from "@mapstore/actions/shapefile";
import { UPDATE_ADDITIONAL_LAYER, REMOVE_ADDITIONAL_LAYER } from "@mapstore/actions/additionallayers";
import {createEpicMiddleware, combineEpics } from 'redux-observable';
import {addFeatureAssetEpic, drawAssetFeatureEpic, downloadFrameEpic, getAssetFeatureEpic, getMissionFeatureEpic, hideAdditionalLayerEpic, overrideMapLayoutEpic, startLoadingAssetsEpic, startLoadingMissionsEpic, updateAdditionalLayerEpic, updateDroneAdditionalLayerEpic, zoomToItemEpic
/*,  hideAssetsLayerEpic, saveAssetEpic*/} from '@js/epics/sciadro';
const rootEpic = combineEpics(addFeatureAssetEpic, drawAssetFeatureEpic, downloadFrameEpic, getAssetFeatureEpic, getMissionFeatureEpic, hideAdditionalLayerEpic, overrideMapLayoutEpic, startLoadingAssetsEpic, startLoadingMissionsEpic, updateAdditionalLayerEpic, updateDroneAdditionalLayerEpic, zoomToItemEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
import MockAdapter from "axios-mock-adapter";
import configureMockStore from 'redux-mock-store';
const mockStore = configureMockStore([epicMiddleware]);
import {testEpic, addTimeoutEpic, TEST_TIMEOUT} from '@mapstore/epics/__tests__/epicTestUtils';
import axios from "@mapstore/libs/ajax";

/*constants for tests*/
const responseResourceAsset = {
    "ShortResource": {
        "canDelete": true,
        "canEdit": true,
        "creation": "2019-04-29T11:54:06.448+02:00",
        "description": "",
        "id": 1,
        "name": "test res"
    }
};
const responseDataResourceAsset = "";
const responseExtJSList = {
    "ExtResourceList": {
        "ResourceCount": 1,
        "Resource": {
            "Attributes": {
                "attribute": [
                    {
                        "@type": "STRING",
                        "name": "sciadroResourceId",
                        "value": "d3c1801c-7eaa-41e2-a32f-44b93302caf6"
                    },
                    {
                        "@type": "STRING",
                        "name": "created",
                        "value": "2019-06-10T09:50:59.886728Z"
                    },
                    {
                        "@type": "STRING",
                        "name": "modified",
                        "value": "2019-06-10T09:51:00.311031Z"
                    },
                    {
                        "@type": "STRING",
                        "name": "note",
                        "value": "null"
                    },
                    {
                        "@type": "STRING",
                        "name": "assetId",
                        "value": "d2f4b671-9aaa-442b-af04-84e56d509945"
                    }
                ]
            },
            "category": {
                "id": 6,
                "name": "MISSION"
            },
            "creation": "2019-06-10T11:52:34.591+02:00",
            "description": 2,
            "id": 902,
            "name": "m2"
        }
    }
};
const attributesResponse = {
    "AttributeList": {
        "Attribute": [
            {
                "name": "sciadroResourceId",
                "type": "STRING",
                "value": "e4b678f6-ffff-4aa7-86a4-f43f6697691d"
            },
            {
                "name": "created",
                "type": "STRING",
                "value": "2019-04-18T14:45:07.261967Z"
            },
            {
                "name": "modified",
                "type": "STRING",
                "value": "2019-04-18T14:45:07.261991Z"
            },
            {
                "name": "note",
                "type": "STRING",
                "value": ""
            },
            {
                "name": "missions",
                "type": "STRING",
                "value": ""
            },
            {
                "name": "type",
                "type": "STRING",
                "value": "POW"
            }
        ]
    }
};
describe('testing sciadro epics', () => {
    let mockAxios;
    let store;
    beforeEach((done) => {
        store = mockStore();
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach((done) => {
        mockAxios.restore();
        epicMiddleware.replaceEpic(rootEpic);
        console.log(store);
        setTimeout(done);
    });
    it('addFeatureAssetEpic, adjusting map layout triggered by ADD_FEATURE_ASSET', (done) => {
        const id = 1;
        const layer = {
            features: [{
                type: "Feature", geometry: {coordinates: [[0, 8], [3, 6]], type: "LineString"}
            }]
        };
        testEpic(addFeatureAssetEpic, 1, addFeatureAsset(layer), actions => {
            expect(actions.length).toBe(1);
            actions.map(action => {
                switch (action.type) {
                    case UPDATE_ADDITIONAL_LAYER:
                        expect(action.id).toBe("assets");
                        break;
                    case UPDATE_ASSET:
                        expect(action.props).toBe({feature: {}});
                        expect(action.id).toBe(id);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, isNew: true, edit: true, name: "name 1" }
                ]
            }
        });
    });
    it('downloadFrameEpic, downloading a specific frame DOWNLOAD_FRAME', (done) => {
        mockAxios.onGet(/assets/).reply(200, "");
        testEpic(downloadFrameEpic, 2, downloadFrame("frame-1"), actions => {
            expect(actions.length).toBe(2);
            actions.map(action => {
                switch (action.type) {
                    case DOWNLOADING_FRAME: {
                        expect(action.downloading).toBe(false);
                        break;
                    }
                    case SHOW_NOTIFICATION:
                        expect(action.message).toBe("sciadro.missions.rest.downloadingFrameSuccess");
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, current: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset"} }
                ],
                missions: [
                    { id: 1, selected: true, current: true, name: "mission 1", attributes: { sciadroResourceId: "sha5-mission", assetId: "sha5-asset"} }
                ]
            }
        });
    });
    it('downloadFrameEpic, downloading a specific frame with error DOWNLOAD_FRAME', (done) => {
        mockAxios.onGet(/assets/).reply(404, "");
        testEpic(downloadFrameEpic, 2, downloadFrame("frame-1"), actions => {
            expect(actions.length).toBe(2);
            actions.map(action => {
                switch (action.type) {
                    case DOWNLOADING_FRAME: {
                        expect(action.downloading).toBe(false);
                        break;
                    }
                    case SHOW_NOTIFICATION:
                        expect(action.message).toBe("sciadro.missions.rest.downloadingFrameError");
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, current: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset"} }
                ],
                missions: [
                    { id: 1, selected: true, current: true, name: "mission 1", attributes: { sciadroResourceId: "sha5-mission", assetId: "sha5-asset"} }
                ]
            }
        });
    });
    it('drawAssetFeatureEpic, drawing Marker triggered by DRAW_ASSET', (done) => {
        testEpic(drawAssetFeatureEpic, 2, drawAsset(1, "Marker"), actions => {
            expect(actions.length).toBe(2);
            actions.map(action => {
                switch (action.type) {
                    case CHANGE_DRAWING_STATUS: {
                        const drawOptions = {
                                stopAfterDrawing: true,
                                editEnabled: false,
                                selectEnabled: false,
                                drawEnabled: true,
                                translateEnabled: false,
                                transformToFeatureCollection: false
                            };
                        expect(action.owner).toBe("sciadro");
                        expect(action.method).toBe("Marker");
                        expect(action.status).toBe("start");
                        expect(action.options).toEqual(drawOptions);
                        break;
                    }
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('drawAssetFeatureEpic, drawing LineString triggered by DRAW_ASSET', (done) => {
        testEpic(drawAssetFeatureEpic, 2, drawAsset(1, "LineString"), actions => {
            expect(actions.length).toBe(2);
            actions.map(action => {
                switch (action.type) {
                    case CHANGE_DRAWING_STATUS: {
                        const drawOptions = {
                                stopAfterDrawing: true,
                                editEnabled: false,
                                selectEnabled: false,
                                drawEnabled: true,
                                translateEnabled: false,
                                transformToFeatureCollection: false
                            };
                        expect(action.owner).toBe("sciadro");
                        expect(action.method).toBe("LineString");
                        expect(action.status).toBe("start");
                        expect(action.options).toEqual(drawOptions);
                        break;
                    }
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('getAssetFeatureEpic, retrieving feature when is selected SELECT_ASSET', (done) => {

        mockAxios.onGet(/assets/).reply(200, {feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}}, name: "asset 1" });
        const numActionsExpected = 4;
        testEpic(getAssetFeatureEpic, numActionsExpected, selectAsset(1), actions => {
            expect(actions.length).toBe(numActionsExpected);
            actions.map(action => {
                switch (action.type) {
                    case LOADING_ASSET_FEATURE:
                        expect(action.loading).toBe(true);
                        break;
                    case UPDATE_ASSET:
                        expect(action.props.loadingFeature).toEqual(false);
                        expect(action.props.feature).toExist();
                        break;
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    case UPDATE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset"} }
                ]
            }
        });
    });
    it('getAssetFeatureEpic, retrieving feature when is selected the current CHANGE_CURRENT_ASSET', (done) => {

        mockAxios.onGet(/assets/).reply(200, {feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}}, name: "asset 1" });
        const numActionsExpected = 5;
        testEpic(getAssetFeatureEpic, numActionsExpected, changeCurrentAsset(1), actions => {
            expect(actions.length).toBe(numActionsExpected);
            actions.map(action => {
                switch (action.type) {
                    case LOADING_ASSET_FEATURE:
                        expect(action.loading).toBe(true);
                        break;
                    case UPDATE_ASSET:
                        expect(action.props.loadingFeature).toEqual(false);
                        expect(action.props.feature).toExist();
                        break;
                    case CHANGE_MODE:
                        expect(action.mode).toEqual("mission-list");
                        break;
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    case UPDATE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset"} }
                ]
            }
        });
    });
    it('getMissionFeatureEpic, retrieving feature when is selected SELECT_MISSION', (done) => {

        mockAxios.onGet(/missions/).reply(200, {feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}}, anomalies: [] });
        const numActionsExpected = 4;
        testEpic(getMissionFeatureEpic, numActionsExpected, selectMission(1), actions => {
            expect(actions.length).toBe(numActionsExpected);
            actions.map((action, i) => {
                switch (action.type) {
                    case LOADING_MISSION_FEATURE:
                        if (i === 0) {
                            expect(action.loading).toBe(true);
                        } else {
                            expect(action.loading).toBe(false);
                        }
                        break;
                    case UPDATE_MISSION:
                        expect(action.props.loadingFeature).toEqual(false);
                        expect(action.props.feature).toExist();
                        break;
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["missions"], action.id)).toBe(true);
                        break;
                    case UPDATE_ADDITIONAL_LAYER:
                        expect(includes(["missions"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, current: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset"} }
                ],
                missions: [
                    { id: 1, selected: true, current: true, name: "mission 1", attributes: { sciadroResourceId: "sha5-mission", assetId: "sha5-asset"} }
                ]
            }
        });
    });
    it('hideAdditionalLayerEpic, drawing Marker triggered by DRAW_ASSET', (done) => {
        testEpic(hideAdditionalLayerEpic, 1, hideAdditionalLayer("assets"), actions => {
            expect(actions.length).toBe(1);
            actions.map(action => {
                switch (action.type) {
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('overrideMapLayoutEpic, adjusting map layout triggered by UPDATE_MAP_LAYOUT', (done) => {
        const layout = {};
        testEpic(overrideMapLayoutEpic, 1, updateMapLayout(layout), actions => {
            expect(actions.length).toBe(1);
            actions.map(action => {
                switch (action.type) {
                    case UPDATE_MAP_LAYOUT:
                    expect(action.layout).toEqual({
                        left: 500,
                        right: 0,
                        bottom: 30,
                        transform: 'none',
                        height: 'calc(100% - 30px)',
                        boundingMapRect: {
                            left: 500,
                            right: 0,
                            bottom: 30
                        }
                    });
                    break;
                    default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            mapLayout: {}
        });
    });
    it('startLoadingAssetsEpic with empty resources triggered by START_LOADING_ASSETS', (done) => {
        mockAxios.onGet(/ASSET/).reply(200, {results: []});
        testEpic(addTimeoutEpic(startLoadingAssetsEpic, 50), 3, startLoadingAssets(), actions => {
            expect(actions.length).toBe(3);
            actions.map((action, i) => {
                switch (action.type) {
                    case LOADING_ASSETS:
                        if (i === 0) {
                            expect(action.loading).toBe(true);
                        } else {
                            expect(action.loading).toBe(false);
                        }
                        break;
                    case LOADED_ASSETS:
                        expect(action.assets).toEqual([]);
                        break;
                    case TEST_TIMEOUT:
                        expect(action.type).toBe(TEST_TIMEOUT);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('startLoadingAssetsEpic triggered by START_LOADING_ASSETS', (done) => {
        const results = {id: 1, name: "name 2"};
        mockAxios.onGet(/ASSET/).reply(200, {results});
        mockAxios.onGet(/resources\/resource\/1\/attributes/).reply(200, attributesResponse);
        mockAxios.onGet(/[\w-\/]*resource\/1/).reply(200, responseResourceAsset);
        mockAxios.onGet(/[\w-\/]*\/data\/1/).reply(200, responseDataResourceAsset);
        testEpic(addTimeoutEpic(startLoadingAssetsEpic, 50), 3, startLoadingAssets(), actions => {
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                    case LOADING_ASSETS:
                        expect(action.loading).toBe(true);
                        break;
                    case LOADED_ASSETS:
                        expect(action.assets).toEqual([ { canDelete: true, canEdit: true, creation: '2019-04-29T11:54:06.448+02:00', description: '', id: 1, name: 'test res', attributes: { sciadroResourceId: 'e4b678f6-ffff-4aa7-86a4-f43f6697691d', created: '2019-04-18T14:45:07.261967Z', modified: '2019-04-18T14:45:07.261991Z', note: '', missions: '', type: 'POW' }, data: '', permissions: { SecurityRuleList: { SecurityRule: [] } } } ] );
                        break;
                    case TEST_TIMEOUT:
                        expect(action.type).toBe(TEST_TIMEOUT);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('startLoadingAssetsEpic triggered by LOGIN_SUCCESS', (done) => {
        const results = [{id: 1, name: "name 2"}];

        mockAxios.onGet(/ASSET/).reply(200, {results});
        mockAxios.onGet(/[\w\/]*resource\/1\/attributes/).reply(200, attributesResponse);
        mockAxios.onGet(/[\w\/]*resource\/1/).reply(200, responseResourceAsset);
        mockAxios.onGet(/[\w\/]*\/data\/1/).reply(200, responseDataResourceAsset);
        testEpic(addTimeoutEpic(startLoadingAssetsEpic, 50), 3, startLoadingAssets(), actions => {
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                    case LOADING_ASSETS:
                        expect(action.loading).toBe(true);
                        break;
                    case LOADED_ASSETS:
                        expect(action.assets).toEqual([ { canDelete: true, canEdit: true, creation: '2019-04-29T11:54:06.448+02:00', description: '', id: 1, name: 'test res', attributes: { sciadroResourceId: 'e4b678f6-ffff-4aa7-86a4-f43f6697691d', created: '2019-04-18T14:45:07.261967Z', modified: '2019-04-18T14:45:07.261991Z', note: '', missions: '', type: 'POW' }, data: '', permissions: { SecurityRuleList: { SecurityRule: [] } } } ]);
                        break;
                    case TEST_TIMEOUT:
                        expect(action.type).toBe(TEST_TIMEOUT);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('startLoadingAssetsEpic with an error when fetching resourceId, triggered by START_LOADING_ASSETS', (done) => {
        const results = [{id: 1, name: "name 2"}];
        mockAxios.onGet(/ASSET/).reply(200, {results});
        mockAxios.onGet(/[\w\/]*resource\/1/).reply(404, {});
        mockAxios.onGet(/[\w\/]*\/data\/1/).reply(200, responseDataResourceAsset);
        mockAxios.onGet(/[\w\/]*resource\/1\/attributes/).reply(200, attributesResponse);
        testEpic(addTimeoutEpic(startLoadingAssetsEpic, 50), 3, startLoadingAssets(), actions => {
            expect(actions.length).toBe(3);
            actions.map((action, i) => {
                switch (action.type) {
                    case LOADING_ASSETS:
                        if (i === 0) {
                            expect(action.loading).toBe(true);
                        } else {
                            expect(action.loading).toBe(false);
                        }
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.message).toBe("sciadro.rest.loadError");
                        break;
                    case TEST_TIMEOUT:
                        expect(action.type).toBe(TEST_TIMEOUT);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('startLoadingMissionsEpic triggered by CHANGE_CURRENT_ASSET', (done) => {
        mockAxios.onPost(/extjs\/search\/list/).reply(200, responseExtJSList);
        const numActions = 4;
        testEpic(addTimeoutEpic(startLoadingMissionsEpic, 50), numActions, changeCurrentAsset(1), actions => {
            expect(actions.length).toBe(numActions);
            actions.map((action, i) => {
                switch (action.type) {
                    case LOADING_MISSIONS:
                        if (i === 0) {
                            expect(action.loading).toBe(true);
                        } else {
                            expect(action.loading).toBe(false);
                        }
                        break;
                    case LOADED_MISSIONS:
                        expect(action.missions.length).toEqual(1);
                        const mission = head(action.missions);
                        console.table(mission);
                        expect(Object.keys(mission).length).toEqual(5);
                        expect(Object.keys(mission)).toEqual([ 'id', 'name', 'description', 'creation', 'attributes' ]);
                        expect(mission.id).toEqual(902);
                        expect(mission.name).toEqual("m2");
                        expect(mission.description).toEqual(2);
                        expect(Object.keys(mission.attributes).length).toEqual(5);
                        expect(mission.attributes.sciadroResourceId).toEqual("d3c1801c-7eaa-41e2-a32f-44b93302caf6");
                        expect(mission.attributes.assetId).toEqual("d2f4b671-9aaa-442b-af04-84e56d509945");

                        break;
                    case UPDATE_ASSET:
                        expect(action.props).toEqual({missionLoaded: true});
                        break;
                    case TEST_TIMEOUT:
                        expect(action.type).toBe(TEST_TIMEOUT);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, current: true, name: "name 1", attributes: {sciadroResourceId: "shaIfd"}, feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
                ]
            }
        });
    });
    it('updateAdditionalLayerEpic, removing all features triggered by RESET_CURRENT_ASSET', (done) => {
        testEpic(updateAdditionalLayerEpic, 5, resetCurrentAsset(), actions => {
            expect(actions.length).toBe(5);
            actions.map(action => {
                switch (action.type) {
                    case CHANGE_DRAWING_STATUS: {
                        expect(action.owner).toBe("sciadro");
                        break;
                    }
                    case ON_SHAPE_SUCCESS: {
                        expect(action.message).toBe(null);
                        break;
                    }
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets", "missions", "drone"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('updateAdditionalLayerEpic, removing asset all features triggered by RESET_CURRENT_ASSET', (done) => {
        store = mockStore();
        testEpic(updateAdditionalLayerEpic, 5, resetCurrentAsset(), actions => {
            expect(actions.length).toBe(5);
            actions.map(action => {
                switch (action.type) {
                    case CHANGE_DRAWING_STATUS: {
                        expect(action.owner).toBe("sciadro");
                        break;
                    }
                    case ON_SHAPE_SUCCESS: {
                        expect(action.message).toBe(null);
                        break;
                    }
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["missions", "drone"], action.id)).toBe(true);
                        break;
                    case UPDATE_ADDITIONAL_LAYER:
                        expect(includes(["assets"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
                ]
            }
        });
    });
    it('updateDroneAdditionalLayerEpic, updating drone feature UPDATE_DRONE_GEOMETRY', (done) => {
        store = mockStore();
        const numActions = 2;
        testEpic(updateDroneAdditionalLayerEpic, numActions, updateDroneGeometry(), actions => {
            expect(actions.length).toBe(numActions);
            actions.map(action => {
                switch (action.type) {
                    case ZOOM_TO_ITEM: {
                        expect(action.zoomTo).toBe("missions");
                        break;
                    }
                    case UPDATE_ADDITIONAL_LAYER:
                        expect(includes(["drone"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    {
                        id: 1,
                        selected: true,
                        current: true,
                        name: "name 1",
                        feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}},
                        attributes: { sciadroResourceId: "sha5-asset" }
                    }
                ],
                missions: [
                    {
                        id: 1,
                        selected: true,
                        current: true,
                        name: "mission 1",
                        feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}},
                        drone: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}, properties: {isVisible: true}},
                        attributes: { sciadroResourceId: "sha5-mission", assetId: "sha5-asset"}
                    }
                ]
            }
        });
    });
    it('updateAdditionalLayerEpic, removing all features triggered by RESET_CURRENT_MISSION', (done) => {
        testEpic(updateAdditionalLayerEpic, 3, resetCurrentMission(), actions => {
            expect(actions.length).toBe(3);
            actions.map(action => {
                switch (action.type) {
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets", "missions", "drone"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('updateAdditionalLayerEpic, removing all features triggered by START_SAVING_ASSET', (done) => {
        testEpic(updateAdditionalLayerEpic, 5, startSavingAsset(), actions => {
            expect(actions.length).toBe(5);
            actions.map(action => {
                switch (action.type) {
                    case CHANGE_DRAWING_STATUS: {
                        expect(action.owner).toBe("sciadro");
                        break;
                    }
                    case ON_SHAPE_SUCCESS: {
                        expect(action.message).toBe(null);
                        break;
                    }
                    case REMOVE_ADDITIONAL_LAYER:
                        expect(includes(["assets", "missions", "drone"], action.id)).toBe(true);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            // state
        });
    });
    it('zoomToItemEpic, zooming on asset Point triggered by ZOOM_TO_ITEM', (done) => {
        const zoomLevel = 10;
        testEpic(zoomToItemEpic, 1, zoomToItem(zoomLevel), actions => {
            expect(actions.length).toBe(1);
            actions.map(action => {
                switch (action.type) {
                    case ZOOM_TO_POINT:
                        expect(action.pos).toEqual([0, 8]);
                        expect(action.zoom).toEqual(zoomLevel);
                        expect(action.crs).toEqual(["EPSG:4326"]);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
                ]
            }
        });
    });
    it('zoomToItemEpic, zooming on asset LineString triggered by ZOOM_TO_ITEM', (done) => {
        testEpic(zoomToItemEpic, 1, zoomToItem(), actions => {
            expect(actions.length).toBe(1);
            actions.map(action => {
                switch (action.type) {
                    case ZOOM_TO_EXTENT:
                        expect(action.extent).toEqual([ 0, 6, 3, 8 ]);
                        expect(action.maxZoom).toEqual(undefined);
                        expect(action.crs).toEqual(["EPSG:4326"]);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                assets: [
                    { id: 1, selected: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [[0, 8], [3, 6]], type: "LineString"}} }
                ]
            }
        });
    });
    it('zoomToItemEpic, zooming on mission Point triggered by ZOOM_TO_ITEM', (done) => {
        const zoomLevel = 10;
        testEpic(zoomToItemEpic, 1, zoomToItem(zoomLevel), actions => {
            expect(actions.length).toBe(1);
            actions.map(action => {
                switch (action.type) {
                    case ZOOM_TO_POINT:
                        expect(action.pos).toEqual([0, 8]);
                        expect(action.zoom).toEqual(zoomLevel);
                        expect(action.crs).toEqual(["EPSG:4326"]);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                missions: [
                    { id: 1, selected: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
                ],
                assets: [
                    { id: 1, selected: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
                ]
            }
        });
    });
    it('zoomToItemEpic, zooming on mission LineString triggered by ZOOM_TO_ITEM', (done) => {
        const numActions = 1;
        testEpic(zoomToItemEpic, numActions, zoomToItem(), actions => {
            expect(actions.length).toBe(numActions);
            actions.map(action => {
                switch (action.type) {
                    case ZOOM_TO_EXTENT:
                        expect(action.extent).toEqual([ 0, 6, 3, 8 ]);
                        expect(action.maxZoom).toEqual(undefined);
                        expect(action.crs).toEqual(["EPSG:4326"]);
                        break;
                    default:
                        expect(true).toBe(false);
                }
            });
            done();
        }, {
            sciadro: {
                missions: [
                    { id: 1, selected: true, name: "name 1", attributes: {assetId: "sha5-asset"}, feature: {type: "Feature", geometry: {coordinates: [[0, 8], [3, 6]], type: "LineString"}} }
                ],
                assets: [
                    { id: 1, attributes: {sciadroResourceId: "sha5-asset"}, selected: true, current: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
                ]
            }
        });
    });
});
