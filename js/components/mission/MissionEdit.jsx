/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, ControlLabel, Col} from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Message from '@mapstore/components/I18N/Message';
import Moment from 'moment';
import {compose} from 'recompose';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(Moment);
require('react-widgets/lib/less/react-widgets.less');

import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import {DateTimePicker} from 'react-widgets';
import { getValidationState, getValidationFiles} from '@js/utils/sciadro';
import LoadingWithText from '@js/components/LoadingWithText';

/**
 * MissionEdit
 * @class
 * @memberof components.MissionEdit
*/
class MissionEdit extends React.Component {
    static propTypes = {
        missions: PropTypes.array,
        missionEdited: PropTypes.object,
        className: PropTypes.string,
        formatDate: PropTypes.string,
        savingMission: PropTypes.bool,
        renderDropZone: PropTypes.func,
        renderToolbarDropzone: PropTypes.func,
        onEditMission: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        formatDate: "DD/MM/YYYY HH:mm:ss",
        missionEdited: {
            attributes: {}
        },
        missions: [],
        savingMission: false,
        className: "",
        renderDropZone: () => null,
        renderToolbarDropzone: () => null,
        onEditMission: () => {}
    };
    render() {
        const mission = this.props.missionEdited;
        const DropZone = this.props.renderDropZone;
        const ToolbarDropzone = this.props.renderToolbarDropzone;

        return (
            <BorderLayout
                className="padding15"
                header={
                    <div style={{ padding: 8 }}>
                    </div>
                }>
                <Form horizontal>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.mandatory"/></ControlLabel>
                        </Col>
                    </FormGroup>
                    <FormGroup validationState={getValidationState(mission && mission.name)}>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.name"/> *</ControlLabel>
                            <FormControl
                                value={mission && mission.name}
                                onChange={(e) => this.props.onEditMission(mission.id, "name", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.description"/></ControlLabel>
                            <FormControl
                                value={mission && mission.description}
                                onChange={(e) => this.props.onEditMission(mission.id, "description", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.note"/></ControlLabel>
                            <FormControl
                                value={mission.attributes && mission.attributes.note}
                                onChange={(e) => this.props.onEditMission(mission.id, "attributes.note", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    {mission && !mission.isNew && <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.created"/> *</ControlLabel>
                            <DateTimePicker
                                calendar={false}
                                disabled
                                format={this.props.formatDate}
                                time={false}
                                defaultValue={new Date(mission.attributes && mission.attributes.created)}
                            />
                        </Col>
                    </FormGroup>}
                    {/* not working when editing*/}
                    <FormGroup validationState={getValidationFiles(mission)}>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.data"/></ControlLabel>
                            <br/>
                            <ToolbarDropzone/>
                            <DropZone/>
                        </Col>
                    </FormGroup>
                </Form>
            </BorderLayout>
        );
    }
}
const MissionEditEnhanced = compose(
   loadingState(({savingMission}) => savingMission, {text: "Saving Mission"}, LoadingWithText),
)(MissionEdit);

export default MissionEditEnhanced;
