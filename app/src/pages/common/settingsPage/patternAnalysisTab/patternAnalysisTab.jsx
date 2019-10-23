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
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { SETTINGS_PAGE_EVENTS, getSaveNewPatternEvent } from 'components/main/analytics/events';
import { patternsSelector, addPatternAction } from 'controllers/project';
import { STRING_PATTERN } from 'common/constants/patternTypes';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { canConfigurePatternAnalysis } from 'common/utils/permissions';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { PatternListHeader } from './patternListHeader';
import { PatternList } from './patternList';
import { NoCasesBlock } from '../noCasesBlock';
import styles from './patternAnalysisTab.scss';

const messages = defineMessages({
  noItemsMessage: {
    id: 'PatternAnalysis.noItemsMessage',
    defaultMessage: 'No Pattern Rules',
  },
  notificationsInfo: {
    id: 'PatternAnalysis.notificationsInfo',
    defaultMessage:
      'System can analyze test results automatically by comparing test result stack trace with saved patterns in the system.',
  },
  createPattern: {
    id: 'PatternAnalysis.createPattern',
    defaultMessage: 'Create pattern',
  },
  createPatternTitle: {
    id: 'PatternAnalysis.createPatternMessage',
    defaultMessage: 'Create pattern rule',
  },
});

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    patterns: patternsSelector(state),
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
  }),
  {
    addPattern: addPatternAction,
    showModal: showModalAction,
  },
)
@track()
export class PatternAnalysisTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    patterns: PropTypes.array,
    addPattern: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
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

  handleSaveNewPattern = (pattern) => {
    this.props.tracking.trackEvent(getSaveNewPatternEvent(pattern.type));
    this.props.addPattern(pattern);
  };

  isAbleToEditForm = () => canConfigurePatternAnalysis(this.props.userRole, this.props.projectRole);

  render() {
    const { intl, patterns } = this.props;
    const readOnly = !this.isAbleToEditForm();

    return (
      <div className={cx('pattern-analysis-tab')}>
        {patterns.length ? (
          <Fragment>
            <PatternListHeader readOnly={readOnly} onAddPattern={this.onAddPattern} />
            <PatternList readOnly={readOnly} patterns={patterns} />
          </Fragment>
        ) : (
          <NoCasesBlock
            noItemsMessage={intl.formatMessage(messages.noItemsMessage)}
            notificationsInfo={intl.formatMessage(messages.notificationsInfo)}
          >
            <div className={cx('create-pattern-button')}>
              <GhostButton disabled={readOnly} icon={PlusIcon} onClick={this.onAddPattern}>
                {intl.formatMessage(messages.createPattern)}
              </GhostButton>
            </div>
          </NoCasesBlock>
        )}
      </div>
    );
  }
}
