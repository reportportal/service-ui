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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';

import { defectTypesSelector, updateDefectSubTypeAction } from 'controllers/project';
import { showModalAction } from 'controllers/modal';
import { userAccountRoleSelector, activeProjectRoleSelector } from 'controllers/user';
import { canUpdateSettings } from 'common/utils/permissions';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';

import { DefectTypesGroup } from './defectTypesGroup';
import { defectTypeShape } from './defectTypeShape';
import { messages } from './defectTypesMessages';
import defaultColors from './defectTypesDefaultColors';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

@track()
@connect(
  (state) => ({
    subTypes: defectTypesSelector(state),
    userAccountRole: userAccountRoleSelector(state),
    userProjectRole: activeProjectRoleSelector(state),
  }),
  {
    showModal: showModalAction,
    updateDefectSubTypeAction,
  },
)
@injectIntl
export class DefectTypesTab extends Component {
  static propTypes = {
    subTypes: PropTypes.objectOf(PropTypes.arrayOf(defectTypeShape)).isRequired,
    showModal: PropTypes.func.isRequired,
    updateDefectSubTypeAction: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    userAccountRole: PropTypes.string.isRequired,
    userProjectRole: PropTypes.string.isRequired,
  };

  showResetColorsConfirmationDialog = () => {
    const { showModal, intl } = this.props;

    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.RESET_DEFAULT_COLOR);
    showModal({
      id: 'confirmationModal',
      data: {
        onConfirm: this.resetColors,
        title: intl.formatMessage(messages.resetColorsModalHeader),
        message: intl.formatMessage(messages.resetColorsModalContent),
        confirmText: intl.formatMessage(COMMON_LOCALE_KEYS.RESET),
        cancelText: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_RESET_DEFECT_COLORS_MODAL,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_BTN_RESET_DEFECT_COLORS_MODAL,
          confirmBtn: SETTINGS_PAGE_EVENTS.RESET_BTN_RESET_DEFECT_COLORS_MODAL,
        },
      },
    });
  };

  resetColors = () => {
    const { subTypes } = this.props;

    this.props.updateDefectSubTypeAction(
      Object.keys(subTypes).reduce((result, typeRef) => {
        // for all defect sub types except system types (with index=0) set default colors
        const newSubTypes = subTypes[typeRef].slice(1).map((subType, i) => ({
          ...subType,
          color: defaultColors[typeRef][i],
        }));

        return [...result, ...newSubTypes];
      }, []),
    );
  };

  isOnlySystemDefectTypes = () =>
    Object.values(this.props.subTypes).every((subTypesGroup) => subTypesGroup.length === 1);

  render() {
    const {
      intl: { formatMessage },
      subTypes,
      userAccountRole,
      userProjectRole,
    } = this.props;
    const isResetDisabled = this.isOnlySystemDefectTypes();
    const isEditable = canUpdateSettings(userAccountRole, userProjectRole);

    return (
      <div className={cx('defect-types-list')}>
        <div className={cx('header')}>
          <div className={cx('header-cell', 'name-cell')}>
            {formatMessage(messages.defectNameCol)}
          </div>
          <div className={cx('header-cell', 'abbr-cell')}>
            {formatMessage(messages.abbreviationCol)}
          </div>
          <div className={cx('header-cell', 'color-cell')}>{formatMessage(messages.colorCol)}</div>
          <div className={cx('header-cell', 'buttons-cell')} />
          <div className={cx('header-cell', 'diagram-cell')}>
            {formatMessage(messages.diagramCol)}
          </div>
        </div>
        {DEFECT_TYPES_SEQUENCE.map((groupName) => (
          <React.Fragment key={groupName}>
            <div className={cx('group-name')}>
              {formatMessage(messages[groupName.toLowerCase()])}
            </div>
            <div className={cx('group')}>
              <DefectTypesGroup group={subTypes[groupName]} readonly={!isEditable} />
            </div>
          </React.Fragment>
        ))}
        {isEditable && (
          <div className={cx('reset-button-wrap')}>
            <button
              className={cx('reset-button')}
              type="button"
              onClick={isResetDisabled ? undefined : this.showResetColorsConfirmationDialog}
              disabled={isResetDisabled}
              title={isResetDisabled ? formatMessage(messages.noColorsToUpdate) : undefined}
            >
              {formatMessage(messages.resetColors)}
            </button>
          </div>
        )}
      </div>
    );
  }
}
