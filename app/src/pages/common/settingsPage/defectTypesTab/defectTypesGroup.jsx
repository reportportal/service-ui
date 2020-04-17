/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';

import { GhostButton } from 'components/buttons/ghostButton';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { addDefectSubTypeAction } from 'controllers/project';

import { DefectSubType } from './defectSubType';
import { defectTypeShape } from './defectTypeShape';
import { messages } from './defectTypesMessages';
import { DefectSubTypeForm } from './defectSubTypeForm';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

@track()
@connect(null, {
  addDefectSubTypeAction,
})
@injectIntl
export class DefectTypesGroup extends Component {
  static propTypes = {
    group: PropTypes.arrayOf(defectTypeShape).isRequired,
    addDefectSubTypeAction: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    readonly: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    readonly: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      newSubType: false,
    };
  }

  showNewSubTypeForm = () => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.ADD_DEFECT_TYPE_BTN);
    this.setState({ newSubType: true });
  };

  closeNewSubTypeForm = () => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.CANCEL_DEFECT_TYPE_CHANGES);
    this.setState({ newSubType: false });
  };

  addDefectSubType = (values) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.SUBMIT_DEFECT_TYPE_CHANGES);
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_DEFECT_TYPE_NAME_DEFECT_TYPE);
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_DEFECT_TYPE_ABBREVIATION);
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.CHANGE_DEFECT_TYPE_COLOR);
    this.props.addDefectSubTypeAction(values);
    this.setState({ newSubType: false });
  };

  MAX_DEFECT_SUBTYPES_COUNT = 15;

  render() {
    const { group, intl, readonly } = this.props;
    const { newSubType } = this.state;

    return (
      <Fragment>
        {group.map((subType, i) => (
          <DefectSubType
            key={subType.id}
            data={subType}
            parentType={group[0]}
            group={i === 0 ? group : null}
            isPossibleUpdateSettings={!readonly}
          />
        ))}
        {newSubType && (
          <div className={cx('defect-type')}>
            <DefectSubTypeForm
              form={group[0].locator}
              initialValues={{
                longName: '',
                shortName: '',
                color: group[0].color,
                typeRef: group[0].typeRef,
              }}
              onDelete={this.closeNewSubTypeForm}
              onConfirm={this.addDefectSubType}
            />
          </div>
        )}
        {!readonly && (
          <div className={cx('defect-type-group-footer')}>
            <GhostButton
              icon={PlusIcon}
              disabled={group.length >= this.MAX_DEFECT_SUBTYPES_COUNT}
              onClick={this.showNewSubTypeForm}
            >
              {intl.formatMessage(messages.addDefectType)}
            </GhostButton>

            <div className={cx('defect-type-count-msg')}>
              {group.length < this.MAX_DEFECT_SUBTYPES_COUNT
                ? `${this.MAX_DEFECT_SUBTYPES_COUNT - group.length} ${intl.formatMessage(
                    messages.subtypesCanBeAdded,
                  )}`
                : intl.formatMessage(messages.allSubtypesAreAdded, {
                    count: this.MAX_DEFECT_SUBTYPES_COUNT,
                  })}
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}
