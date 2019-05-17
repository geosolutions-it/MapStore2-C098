/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import React from "react";
import ReactDOM from "react-dom";
import Toolbar from "@js/components/Toolbar";
import TestUtils from 'react-dom/test-utils';

const defaultButtonsStatus = {
    back: false,
    zoom: false,
    saveDisabled: false,
    zoomDisabled: false,
    saveError: {
        message: "",
        visible: false
    },
    searchDate: {
        disaled: true,
        error: true,
        visible: false
    },
    clearFilter: {
        disaled: true,
        visible: false
    },
    edit: false,
    add: false,
    save: false,
    draw: false
};

describe('testing Toolbar in Components', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('rendering Toolbar with defaults', () => {
        const container = ReactDOM.render(<Toolbar />, document.getElementById("container"));
        expect(container).toExist();
    });
    it('rendering Toolbar in asset-list mode, only add present', () => {
        const toolbar = ReactDOM.render(
            <Toolbar
                mode = "asset-list"
                buttonsStatus = {{
                    ...defaultButtonsStatus,
                    add: true
                }}
            />, document.getElementById("container"));
        expect(toolbar).toExist();
        const add = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-plus")[0]);
        expect(add).toExist();
    });
    it('rendering Toolbar in asset-edit mode, new asset', () => {
        const toolbar = ReactDOM.render(
            <Toolbar
                mode = "asset-edit"
                buttonsStatus = {{
                    ...defaultButtonsStatus,
                    back: true,
                    save: true,
                    saveDisabled: true
                }}
            />, document.getElementById("container"));
        expect(toolbar).toExist();
        const back = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-arrow-left")[0]);
        expect(back).toExist();
        const save = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-floppy-disk")[0]);
        expect(save).toExist();
        const saveBtn = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "btn btn-primary")[1]);
        expect(saveBtn).toExist();
        expect(saveBtn.disabled).toBe(true);
    });
    it('rendering Toolbar in asset-edit mode, with error', () => {
        const toolbar = ReactDOM.render(
            <Toolbar
                mode = "asset-edit"
                buttonsStatus = {{
                    ...defaultButtonsStatus,
                    back: true,
                    save: true,
                    saveDisabled: true,
                    saveError: {
                        message: "sciadro.rest.saveError",
                        visible: true}
                }}
            />, document.getElementById("container"));
        expect(toolbar).toExist();
        const back = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-arrow-left")[0]);
        expect(back).toExist();
        const save = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-floppy-disk")[0]);
        expect(save).toExist();
        const saveError = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-exclamation-mark")[0]);
        expect(saveError).toExist();
        const saveBtn = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "btn btn-primary")[1]);
        expect(saveBtn).toExist();
        expect(saveBtn.disabled).toBe(true);
    });
    it('rendering Toolbar in mission-list mode, with a mission selected', () => {
        const toolbar = ReactDOM.render(
            <Toolbar
                assetSelected = {{id: 1}}
                mode = "mission-list"
                buttonsStatus = {{
                    ...defaultButtonsStatus,
                    back: true,
                    zoom: true,
                    edit: true,
                    zoomDisabled: false
                }}
            />, document.getElementById("container"));
        expect(toolbar).toExist();
        const back = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-arrow-left")[0]);
        expect(back).toExist();
        const edit = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-wrench")[0]);
        expect(edit).toExist();
        const zoom = ReactDOM.findDOMNode(TestUtils.scryRenderedDOMComponentsWithClass(toolbar, "glyphicon-zoom-to")[0]);
        expect(zoom).toExist();
    });
    it('tests all the actions from toolbar', () => {
    });
});
