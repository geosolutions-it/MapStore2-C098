/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import React from 'react';
import PropTypes from 'prop-types';
import DockablePanel from '../../MapStore2/web/client/components/misc/panels/DockablePanel';
import Message from '../../MapStore2/web/client/components/I18N/Message';
import Toolbar from './Toolbar';

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
        size: PropTypes.number
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
        size: 660
    };

    render() {
        return (<DockablePanel
            dock={this.props.dock}
            bsStyle={this.props.bsStyle}
            position={this.props.position}
            title={<Message key="title" msgId={`sciadro.mode.${this.props.mode}`}/>}
            glyph={this.props.glyph}
            size={this.props.size}
            open={this.props.show}>
                <Toolbar/>
            </DockablePanel>);

    }
}

export default Container;
