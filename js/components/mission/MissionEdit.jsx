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
import {find} from 'lodash';

import Moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(Moment);
require('react-widgets/lib/less/react-widgets.less');

import {DateTimePicker} from 'react-widgets';
import {getValidationState} from '../../utils/sciadro';

/**
 * MissionEdit
 * @class
 * @memberof components.MissionEdit
*/
class MissionEdit extends React.Component {
    static propTypes = {
        missions: PropTypes.array,
        className: PropTypes.string,
        onEditMission: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        missions: [],
        className: "",
        onEditMission: () => {}
    };
    render() {
        const mission = find(this.props.missions, a => a.edit) || {};

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
                    <FormGroup validationState={getValidationState(mission.name)}>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.name"/> *</ControlLabel>
                            <FormControl
                                value={mission.name}
                                onChange={(e) => this.props.onEditMission(mission.id, "name", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.description"/></ControlLabel>
                            <FormControl
                                value={mission.description}
                                onChange={(e) => this.props.onEditMission(mission.id, "description", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.note"/></ControlLabel>
                            <FormControl
                                value={mission.note}
                                onChange={(e) => this.props.onEditMission(mission.id, "note", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup validationState={getValidationState(mission.created)}>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.created"/> *</ControlLabel>
                            <DateTimePicker
                                time
                                value={mission.created}
                                calendar
                                format="L"
                                onChange={(date) => this.props.onEditMission(mission.id, "created", date)}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.missions.data"/></ControlLabel>
                            <br/>
                            <img src="/assets/images/upload_geom.png"/>
                        </Col>
                    </FormGroup>
                </Form>
            </BorderLayout>
        );
    }
}

export default MissionEdit;
