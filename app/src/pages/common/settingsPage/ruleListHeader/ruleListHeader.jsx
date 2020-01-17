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
import Parser from 'html-react-parser';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import styles from './ruleListHeader.scss';

const cx = classNames.bind(styles);

@injectIntl
@track()
export class RuleListHeader extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onAddItem: PropTypes.func,
    switcherValue: PropTypes.bool,
    messages: PropTypes.object.isRequired,
    onChangeSwitcher: PropTypes.func,
    titleMessage: PropTypes.string,
    readOnly: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    id: 0,
    onAddItem: () => {},
    onChangeSwitcher: () => {},
    switcherValue: false,
    readOnly: false,
    titleMessage: '',
  };

  render() {
    const {
      intl: { formatMessage },
      onAddItem,
      switcherValue,
      onChangeSwitcher,
      readOnly,
      messages,
      titleMessage,
    } = this.props;
    return (
      <div className={cx('list-header')}>
        <span className={cx('caption')}>{formatMessage(messages.toggleLabel)}</span>
        <InputBigSwitcher
          disabled={readOnly}
          title={titleMessage}
          mobileDisabled
          value={switcherValue}
          onChange={onChangeSwitcher}
        />
        <p className={cx('description')}>{Parser(formatMessage(messages.toggleNote))}</p>
        <span className={cx('create-button')}>
          <GhostButton disabled={readOnly} mobileDisabled icon={PlusIcon} onClick={onAddItem}>
            {formatMessage(messages.create)}
          </GhostButton>
        </span>
      </div>
    );
  }
}
