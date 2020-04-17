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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { SETTINGS_PAGE_EVENTS, getSaveNewPatternEvent } from 'components/main/analytics/events';
import {
  patternsSelector,
  addPatternAction,
  PAStateSelector,
  updatePAStateAction,
  updatePatternAction,
  deletePatternAction,
} from 'controllers/project';
import { STRING_PATTERN } from 'common/constants/patternTypes';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { canUpdateSettings } from 'common/utils/permissions';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { NoCasesBlock } from 'components/main/noCasesBlock';
import { RuleListHeader } from '../ruleListHeader';
import { RuleList } from '../ruleList';
import styles from './patternAnalysisTab.scss';
import { messages } from './messages';

const COPY_POSTFIX = '_copy';
const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    patterns: patternsSelector(state),
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    PAState: PAStateSelector(state),
  }),
  {
    addPattern: addPatternAction,
    showModal: showModalAction,
    updatePAState: updatePAStateAction,
    updatePattern: updatePatternAction,
    deletePattern: deletePatternAction,
  },
)
@track()
export class PatternAnalysisTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    patterns: PropTypes.array,
    addPattern: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    PAState: PropTypes.bool.isRequired,
    updatePattern: PropTypes.func.isRequired,
    deletePattern: PropTypes.func.isRequired,
    updatePAState: PropTypes.func,
    userRole: PropTypes.string,
    projectRole: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    patterns: [],
    userRole: '',
    projectRole: '',
    updatePAState: () => {},
  };

  onAddPattern = () => {
    const { intl, showModal, tracking } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.CREATE_PATTERN_BTN);
    showModal({
      id: 'createPatternModal',
      data: {
        onSave: this.handleSaveNewPattern,
        pattern: {
          type: STRING_PATTERN,
          enabled: true,
        },
        modalTitle: intl.formatMessage(messages.createPatternTitle),
        isNewPattern: true,
        eventsInfo: {
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_BTN_CREATE_PATTERN_MODAL,
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_CREATE_PATTERN_MODAL,
        },
      },
    });
  };

  onRenamePattern = (pattern) => {
    const { showModal, updatePattern, tracking } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_PATTERN_ICON);
    showModal({
      id: 'renamePatternModal',
      data: {
        onSave: updatePattern,
        pattern,
      },
    });
  };

  onClonePattern = (pattern) => {
    const { intl, showModal, tracking } = this.props;
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

  onDeletePattern = (pattern) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.DELETE_PATTERN_ICON);
    this.props.deletePattern(pattern);
  };

  onToggleHandler = (enabled, pattern) => {
    const { updatePattern, tracking } = this.props;
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

  showDeleteConfirmationDialog = (pattern) => {
    const { showModal, intl } = this.props;
    showModal({
      id: 'deleteItemsModal',
      data: {
        onConfirm: () => this.onDeletePattern(pattern),
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

  handleSaveNewPattern = (pattern) => {
    this.props.tracking.trackEvent(getSaveNewPatternEvent(pattern.type));
    this.props.addPattern(pattern);
  };

  handleOnChangeSwitcher = (PAState) => {
    this.props.tracking.trackEvent(
      PAState
        ? SETTINGS_PAGE_EVENTS.TURN_ON_PA_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_PA_SWITCHER,
    );
    this.props.updatePAState(PAState);
  };

  handleSaveClonedPattern = (pattern) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.SAVE_BTN_CLONE_PATTERN_MODAL);
    this.props.addPattern(pattern);
  };

  getPanelTitle = (name) => name;

  getListItemContentData = (pattern) => [
    {
      key: this.props.intl.formatMessage(messages[pattern.type.toUpperCase()]),
      value: pattern.value,
    },
  ];

  isAbleToEditForm = () => canUpdateSettings(this.props.userRole, this.props.projectRole);

  render() {
    const { intl, patterns, PAState } = this.props;
    const readOnly = !this.isAbleToEditForm();

    return (
      <div className={cx('pattern-analysis-tab')}>
        {patterns.length ? (
          <Fragment>
            <RuleListHeader
              readOnly={readOnly}
              messages={messages}
              switcherValue={PAState}
              onAddItem={this.onAddPattern}
              onChangeSwitcher={this.handleOnChangeSwitcher}
            />
            <RuleList
              readOnly={readOnly}
              data={patterns}
              onToggle={this.onToggleHandler}
              onDelete={this.showDeleteConfirmationDialog}
              onEdit={this.onRenamePattern}
              onClone={this.onClonePattern}
              getPanelTitle={this.getPanelTitle}
              getListItemContentData={this.getListItemContentData}
              isCloned
              messages={messages}
            />
          </Fragment>
        ) : (
          <NoCasesBlock
            noItemsMessage={intl.formatMessage(messages.noItemsMessage)}
            notificationsInfo={intl.formatMessage(messages.notificationsInfo)}
          >
            <div className={cx('create-pattern-button')}>
              <GhostButton disabled={readOnly} icon={PlusIcon} onClick={this.onAddPattern}>
                {intl.formatMessage(messages.create)}
              </GhostButton>
            </div>
          </NoCasesBlock>
        )}
      </div>
    );
  }
}
