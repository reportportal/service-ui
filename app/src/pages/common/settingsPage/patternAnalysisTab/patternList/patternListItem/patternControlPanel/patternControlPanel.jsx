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
import Parser from 'html-react-parser';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import track from 'react-tracking';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import IconEdit from 'common/img/pencil-empty-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import IconDelete from 'common/img/trashcan-inline.svg';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { addPatternAction, updatePatternAction, deletePatternAction } from 'controllers/project';
import { showModalAction } from 'controllers/modal';
import classNames from 'classnames/bind';
import styles from './patternControlPanel.scss';

const COPY_POSTFIX = '_copy';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  deleteModalHeader: {
    id: 'PatternAnalysis.deleteModalHeader',
    defaultMessage: 'Delete Pattern Rule',
  },
  deleteModalContent: {
    id: 'PatternAnalysis.deleteModalContent',
    defaultMessage: 'Are you sure you want to delete pattern rule {name}?',
  },
  clonePatternMessage: {
    id: 'PatternAnalysis.clonePatternMessage',
    defaultMessage: 'Clone pattern rule',
  },
});

@connect(null, {
  addPattern: addPatternAction,
  updatePattern: updatePatternAction,
  deletePattern: deletePatternAction,
  showModal: showModalAction,
})
@injectIntl
@track()
export class PatternControlPanel extends Component {
  static propTypes = {
    pattern: PropTypes.object,
    id: PropTypes.number,
    addPattern: PropTypes.func.isRequired,
    updatePattern: PropTypes.func.isRequired,
    deletePattern: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    readOnly: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
    readOnly: false,
  };

  onRenamePattern = () => {
    const { showModal, updatePattern, pattern, tracking } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_PATTERN_ICON);
    showModal({
      id: 'renamePatternModal',
      data: {
        onSave: updatePattern,
        pattern,
      },
    });
  };

  onClonePattern = () => {
    const { intl, showModal, pattern, tracking } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.CLONE_PATTERN_ICON);
    const newPattern = {
      ...pattern,
      name: pattern.name + COPY_POSTFIX,
    };
    delete newPattern.id;
    showModal({
      id: 'createPatternModal',
      data: {
        onSave: this.handleSaveClonedPattern,
        pattern: newPattern,
        modalTitle: intl.formatMessage(messages.clonePatternMessage),
        eventsInfo: {
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_BTN_CLONE_PATTERN_MODAL,
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_CLONE_PATTERN_MODAL,
        },
      },
    });
  };

  onToggleActive = (enabled) => {
    const { updatePattern, pattern, tracking } = this.props;
    tracking.trackEvent(
      enabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_PA_RULE_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_PA_RULE_SWITCHER,
    );
    updatePattern({
      ...pattern,
      enabled,
    });
  };

  onDeletePattern = () => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.DELETE_PATTERN_ICON);
    this.props.deletePattern(this.props.pattern);
  };

  handleSaveClonedPattern = (pattern) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.SAVE_BTN_CLONE_PATTERN_MODAL);
    this.props.addPattern(pattern);
  };

  showDeleteConfirmationDialog = () => {
    const { pattern, showModal, intl } = this.props;
    showModal({
      id: 'deleteItemsModal',
      data: {
        onConfirm: this.onDeletePattern,
        header: intl.formatMessage(messages.deleteModalHeader),
        mainContent: intl.formatMessage(messages.deleteModalContent, {
          name: `'<b>${pattern.name}</b>'`,
        }),
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_DELETE_PATTERN_MODAL,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_BTN_DELETE_PATTERN_MODAL,
          deleteBtn: SETTINGS_PAGE_EVENTS.DELETE_BTN_DELETE_PATTERN_MODAL,
        },
      },
    });
  };

  render() {
    const { id, pattern, readOnly } = this.props;
    return (
      <div className={cx('pattern-control-panel')}>
        <span className={cx('pattern-number')}>{id + 1}</span>
        <span className={cx('switcher', { disabled: readOnly })}>
          <InputSwitcher
            value={pattern.enabled}
            readOnly={readOnly}
            onChange={this.onToggleActive}
          />
        </span>
        <span className={cx('pattern-name')}>{pattern.name}</span>
        {!readOnly && (
          <div className={cx('panel-buttons')}>
            <button className={cx('panel-button')} onClick={this.onRenamePattern}>
              {Parser(IconEdit)}
            </button>
            <button className={cx('panel-button')} onClick={this.onClonePattern}>
              {Parser(IconDuplicate)}
            </button>
            <button
              className={cx('panel-button', 'filled')}
              onClick={this.showDeleteConfirmationDialog}
            >
              {Parser(IconDelete)}
            </button>
          </div>
        )}
      </div>
    );
  }
}
