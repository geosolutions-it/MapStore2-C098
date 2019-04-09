/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar } from 'react-bootstrap';

// import Message from '../../MapStore2/web/client/components/I18N/Message';
import Toolbar from '../../MapStore2/web/client/components/misc/toolbar/Toolbar';

/**
 * Toolbar for sciadro app
 * @class
 * @memberof components.Toolbar
 */
class MainToolbar extends React.Component {
    static propTypes = {
        size: PropTypes.number,
        mode: PropTypes.string
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        mode: "asset-list"
    };

    render() {
        return (
            <ButtonToolbar className="buttonToolbar">
                <Toolbar
                    btnGroupProps = {{ className: 'btn-group-menu-options'}}
                    transitionProps = {null}
                    btnDefaultProps = {{ className: 'square-button-md', bsStyle: 'primary' }}
                    buttons = {[
                        {
                            tooltipId: "sciadro.assets.add",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                // do things
                            },
                            glyph: "plus",
                            visible: this.props.mode === "asset-list"
                        },
                        {
                            tooltipId: "sciadro.assets.add",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                // do things
                            },
                            glyph: "plus",
                            visible: this.props.mode === "mission-list"
                        }
                    ]}
                />
            </ButtonToolbar>
        );
    }
}

export default MainToolbar;
