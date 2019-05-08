/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {includes} from 'lodash';
import {
    addFeatureAsset,
    changeCurrentAsset,
    drawAsset,
    hideAdditionalLayer,
    resetCurrentAsset,
    resetCurrentMission,
    selectMission,
    selectAsset,
    startLoadingAssets,
    startSavingAsset,
    zoomToItem,
    CHANGE_MODE,
    LOADING_ASSETS,
    LOADING_ASSET_FEATURE,
    LOADED_ASSETS,
    LOADING_MISSIONS,
    LOADING_MISSION_FEATURE,
    LOADED_MISSIONS,
    UPDATE_ASSET,
    UPDATE_MISSION
} from "@js/actions/sciadro";
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '@mapstore/actions/maplayout';
import { SHOW_NOTIFICATION } from "@mapstore/actions/notifications";
import { CHANGE_DRAWING_STATUS } from "@mapstore/actions/draw";
import { ZOOM_TO_POINT, ZOOM_TO_EXTENT } from "@mapstore/actions/map";
import { ON_SHAPE_SUCCESS } from "@mapstore/actions/shapefile";
import { UPDATE_ADDITIONAL_LAYER, REMOVE_ADDITIONAL_LAYER } from "@mapstore/actions/additionallayers";
import {createEpicMiddleware, combineEpics } from 'redux-observable';
import {addFeatureAssetEpic, drawAssetFeatureEpic, getAssetFeatureEpic, getMissionFeatureEpic, hideAdditionalLayerEpic, overrideMapLayoutEpic, startLoadingAssetsEpic, startLoadingMissionsEpic, updateAdditionalLayerEpic, zoomToItemEpic
/*,  hideAssetsLayerEpic, saveAssetEpic*/} from '@js/epics/sciadro';
const rootEpic = combineEpics(addFeatureAssetEpic, drawAssetFeatureEpic, getAssetFeatureEpic, getMissionFeatureEpic, hideAdditionalLayerEpic, overrideMapLayoutEpic, startLoadingAssetsEpic, startLoadingMissionsEpic, updateAdditionalLayerEpic, zoomToItemEpic);
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
                "name": "missionsId",
                "type": "STRING",
                "value": ""
            },
            {
                "name": "type",
                "type": "STRING",
                "value": "powerline"
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
        // mockAxios.reset();
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
                    { id: 1, selected: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset", missionsId: "1"} }
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
                    { id: 1, selected: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset", missionsId: "1"} }
                ]
            }
        });
    });
    it('getMissionFeatureEpic, retrieving feature when is selected SELECT_MISSION', (done) => {

        mockAxios.onGet(/assets/).reply(200, {feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} });
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
                    { id: 1, selected: true, name: "asset 1", attributes: { sciadroResourceId: "sha5-asset", missionsId: "1"} }
                ],
                missions: [
                    { id: 1, selected: true, name: "mission 1", attributes: { sciadroResourceId: "sha5-mission"} }
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
                        expect(action.assets).toEqual([ { canDelete: true, canEdit: true, creation: '2019-04-29T11:54:06.448+02:00', description: '', id: 1, name: 'test res', attributes: { sciadroResourceId: 'e4b678f6-ffff-4aa7-86a4-f43f6697691d', created: '2019-04-18T14:45:07.261967Z', modified: '2019-04-18T14:45:07.261991Z', note: '', missionsId: '', type: 'powerline' }, data: '' } ] );
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
                        expect(action.assets).toEqual([ { canDelete: true, canEdit: true, creation: '2019-04-29T11:54:06.448+02:00', description: '', id: 1, name: 'test res', attributes: { sciadroResourceId: 'e4b678f6-ffff-4aa7-86a4-f43f6697691d', created: '2019-04-18T14:45:07.261967Z', modified: '2019-04-18T14:45:07.261991Z', note: '', missionsId: '', type: 'powerline' }, data: '' } ]);
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
        const results = {id: 1, name: "name 2"};
        mockAxios.onGet(/ASSET/).reply(200, {results});
        mockAxios.onGet(/resources\/resource\/1\/attributes/).reply(200, attributesResponse);
        mockAxios.onGet(/[\w-\/]*resource\/1/).reply(200, responseResourceAsset);
        mockAxios.onGet(/[\w-\/]*\/data\/1/).reply(200, responseDataResourceAsset);
        testEpic(addTimeoutEpic(startLoadingMissionsEpic, 50), 4, changeCurrentAsset(1), actions => {
            expect(actions.length).toBe(4);
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
                        expect(action.missions).toEqual([ { canDelete: true, canEdit: true, creation: '2019-04-29T11:54:06.448+02:00', description: '', id: 1, name: 'test res', attributes: { sciadroResourceId: 'e4b678f6-ffff-4aa7-86a4-f43f6697691d', created: '2019-04-18T14:45:07.261967Z', modified: '2019-04-18T14:45:07.261991Z', note: '', missionsId: '', type: 'powerline' }, data: '' } ] );
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
                    { id: 1, selected: true, name: "name 1", attributes: { missionsId: "1" }, feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
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
                missions: [
                    { id: 1, selected: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [[0, 8], [3, 6]], type: "LineString"}} }
                ],
                assets: [
                    { id: 1, attributes: {missionsId: "1"}, selected: true, name: "name 1", feature: {type: "Feature", geometry: {coordinates: [0, 8], type: "Point"}} }
                ]
            }
        });
    });
});
