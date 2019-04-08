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

/**
 * Main Container for sciadro app
 * @class
 * @memberof components.Container
 * @prop {boolean} show the panel

 */
class Container extends React.Component {
    static propTypes = {
        show: PropTypes.bool
    };

    static defaultProps = {
        show: true
    };

    render() {

        return (<DockablePanel
            dock
            bsStyle="primary"
            position="left"
            title={<Message key="title" msgId="sciadro.title"/>}
            glyph="1-ruler"
            size={660}
            open={this.props.show}>
                Main panel component
            </DockablePanel>);

    }
}

export default Container;
