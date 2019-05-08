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

// import Message from '@mapstore/components/I18N/Message';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

/**
 * Toolbar for sciadro app
 * @class
 * @memberof components.Toolbar
 */
export default class ToolbarGeometry extends React.Component {
    static propTypes = {
        missionEdited: PropTypes.object,
        buttonsStatus: PropTypes.object,
        onDropFiles: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        missionEdited: {},
        buttonsStatus: {
            deleteFiles: true,
            deleteFilesDisabled: true
        },
        onDrawAsset: () => {},
        onDeleteAssetFeature: () => {}
    };

    render() {
        const { missionEdited, buttonsStatus } = this.props;
        return (
            <ButtonToolbar className="buttonToolbar">
                <Toolbar
                    btnGroupProps = {{ className: 'btn-group-menu-options'}}
                    transitionProps = { null }
                    btnDefaultProps = {{ className: 'square-button-md', bsStyle: 'primary' }}
                    buttons = {[
                        {
                            tooltipId: "sciadro.missions.file-trash",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                if (missionEdited && missionEdited.id) {
                                    this.props.onDropFiles(null);
                                }
                            },
                            glyph: "trash",
                            visible: buttonsStatus.deleteFiles,
                            disabled: buttonsStatus.deleteFilesDisabled
                        }
                    ]}
                />
            </ButtonToolbar>
        );
    }
}
