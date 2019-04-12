/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import React from 'react';
import PropTypes from 'prop-types';
import DockablePanel from '@mapstore/components/misc/panels/DockablePanel';
import Message from '@mapstore/components/I18N/Message';
import Toolbar from './Toolbar';
import {pick} from 'lodash';
import AssetList from './asset/AssetList';
import AssetEdit from './asset/AssetEdit';
import MissionList from './mission/MissionList';
import MissionDetail from './mission/MissionDetail';
import MissionEdit from './mission/MissionEdit';
import BorderLayout from '@mapstore/components/layout/BorderLayout';

/**
 * Main Container for sciadro app
 * @class
 * @memberof components.Container
 * @prop {boolean} show the panel
*/
class Container extends React.Component {
    static propTypes = {
        bsStyle: PropTypes.string,
        dock: PropTypes.bool,
        glyph: PropTypes.string,
        mode: PropTypes.string,
        position: PropTypes.string,
        title: PropTypes.string,
        show: PropTypes.bool,
        size: PropTypes.number,

        // components
        drawMethod: PropTypes.string,
        assets: PropTypes.array,
        missions: PropTypes.array,
        anomalies: PropTypes.array,
        onLoadAssets: PropTypes.func,
        onChangeMode: PropTypes.func,
        onResetCurrentAsset: PropTypes.func,
        onChangeCurrentAsset: PropTypes.func,
        onSelectMission: PropTypes.func,
        onEditAsset: PropTypes.func,
        onEditMission: PropTypes.func,
        onAddAsset: PropTypes.func,
        onAddMission: PropTypes.func,
        onDrawAsset: PropTypes.func,
        onChangeCurrentMission: PropTypes.func,
        onResetCurrentMission: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        bsStyle: "primary",
        dock: true,
        glyph: "",
        mode: "asset-list",
        position: "left",
        title: "sciadro.titlePanel",
        show: true,
        size: 350,

        // sciadro
        drawMethod: "",
        onLoadAssets: () => {},
        onChangeMode: () => {},
        onResetCurrentAsset: () => {},
        onResetCurrentMission: () => {},
        onChangeCurrentAsset: () => {},
        onSelectMission: () => {},
        onEditAsset: () => {},
        onEditMission: () => {},
        onAddAsset: () => {},
        onDrawAsset: () => {},
        onAddMission: () => {},
        onChangeCurrentMission: () => {}
    };

    render() {
        const assetProps = pick(this.props, ["onLoadAssets", "onChangeCurrentAsset", "assets"]);
        const assetEditProps = pick(this.props, ["assets", "onEditAsset"]);
        const missionEditProps = pick(this.props, ["missions", "onEditMission"]);
        const missionProps = pick(this.props, ["missions", "assets", "onSelectMission", "onChangeCurrentMission"]);
        const toolbarProps = pick(this.props, ["assets", "mode", "onChangeMode", "onResetCurrentAsset", "onResetCurrentMission", "onAddAsset", "onAddMission", "onDrawAsset", "drawMethod"]);
        const missionDetailProps = pick(this.props, ["mode", "missions"]);
        const anomaliesProps = pick(this.props, ["anomalies"]);

        return (<DockablePanel
            dock={this.props.dock}
            bsStyle={this.props.bsStyle}
            position={this.props.position}
            title={<Message key="title" msgId={`sciadro.mode.${this.props.mode}`}/>}
            glyph={this.props.glyph}
            size={this.props.size}
            open={this.props.show}>
            <BorderLayout
                header={
                    <Toolbar {...toolbarProps}/>
                }>
                {this.props.mode === "asset-list" && <AssetList {...assetProps}/>}
                {this.props.mode === "asset-edit" && <AssetEdit {...assetEditProps}/>}
                {this.props.mode === "mission-edit" && <MissionEdit {...missionEditProps}/>}
                {this.props.mode === "mission-list" && <MissionList {...missionProps}/>}
                {this.props.mode === "mission-detail" && <MissionDetail {...missionDetailProps} {...anomaliesProps}/>}
                </BorderLayout>
            </DockablePanel>);

    }
}

export default Container;
