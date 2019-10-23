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
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { PAStateSelector, updatePAStateAction } from 'controllers/project';
import styles from './patternListHeader.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  patternAnalysis: {
    id: 'PatternAnalysis.title',
    defaultMessage: 'Pattern-Analysis',
  },
  enablePA: {
    id: 'PatternAnalysis.enablePA',
    defaultMessage:
      'If ON - analysis starts as soon as any launch finished<br/>If OFF - not automatic, but can be invoked manually',
  },
  createPattern: {
    id: 'PatternAnalysis.createPattern',
    defaultMessage: 'Create pattern',
  },
});

@injectIntl
@connect(
  (state) => ({
    PAState: PAStateSelector(state),
  }),
  {
    updatePAState: updatePAStateAction,
  },
)
@track()
export class PatternListHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onAddPattern: PropTypes.func,
    PAState: PropTypes.bool.isRequired,
    updatePAState: PropTypes.func,
    readOnly: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
    onAddPattern: () => {},
    updatePAState: () => {},
    readOnly: false,
  };

  handleUpdatePAState = (PAState) => {
    this.props.tracking.trackEvent(
      PAState
        ? SETTINGS_PAGE_EVENTS.TURN_ON_PA_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_PA_SWITCHER,
    );
    this.props.updatePAState(PAState);
  };

  render() {
    const {
      intl: { formatMessage },
      onAddPattern,
      PAState,
      readOnly,
    } = this.props;
    return (
      <div className={cx('pattern-list-header')}>
        <span className={cx('caption')}>{formatMessage(messages.patternAnalysis)}</span>
        <InputBigSwitcher
          disabled={readOnly}
          mobileDisabled
          value={PAState}
          onChange={this.handleUpdatePAState}
        />
        <p className={cx('description')}>{Parser(formatMessage(messages.enablePA))}</p>
        <span className={cx('create-button')}>
          <GhostButton disabled={readOnly} mobileDisabled icon={PlusIcon} onClick={onAddPattern}>
            {formatMessage(messages.createPattern)}
          </GhostButton>
        </span>
      </div>
    );
  }
}
