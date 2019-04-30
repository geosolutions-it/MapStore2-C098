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
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Message from '@mapstore/components/I18N/Message';

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
        position: PropTypes.string,
        title: PropTypes.string,
        show: PropTypes.bool,
        size: PropTypes.number,
        // sciadro
        componentsCfg: PropTypes.object,
        toolbarCfg: PropTypes.object,
        mode: PropTypes.string,
        renderBodyComponents: PropTypes.object,
        renderToolbarComponent: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        renderBodyComponents: {
            "asset-list": () => null
        },
        componentsCfg: {
            "asset-list": {}
        },
        toolbarCfg: {
            "asset-list": {}
        },
        renderToolbarComponent: () => null,
        bsStyle: "primary",
        dock: true,
        glyph: "",
        position: "left",
        title: "sciadro.titlePanel",
        show: true,
        size: 500,

        // sciadro
        mode: "asset-list"

    };

    render() {
        const { mode } = this.props;
        const BodyComp = this.props.renderBodyComponents[mode];
        const ToolbarComp = this.props.renderToolbarComponent;
        return (<DockablePanel
            dock={this.props.dock}
            bsStyle={this.props.bsStyle}
            position={this.props.position}
            title={<Message key="title" msgId={`sciadro.mode.${mode}`}/>}
            glyph={this.props.glyph}
            size={this.props.size}
            open={this.props.show}>
            <BorderLayout
                header={<ToolbarComp {...this.props.toolbarCfg}/>}>
                <BodyComp {...this.props.componentsCfg[mode]}/>
            </BorderLayout>
        </DockablePanel>);

    }
}

export default Container;
