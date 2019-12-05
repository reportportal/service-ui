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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import classNames from 'classnames/bind';
import { apiTokenValueSelector, generateApiTokenAction } from 'controllers/user';
import { Input } from 'components/inputs/input/input';
import { GhostButton } from 'components/buttons/ghostButton';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import { defineMessages, injectIntl } from 'react-intl';
import { ButtonWithTooltip } from './buttonWithTooltip';
import styles from './accessTokenBlock.scss';
import { BlockContainerHeader, BlockContainerBody } from '../blockContainer';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'AccessTokenBlock.header',
    defaultMessage: 'Access token',
  },
  regenerate: {
    id: 'AccessTokenBlock.regenerate',
    defaultMessage: 'Regenerate',
  },
  text: {
    id: 'AccessTokenBlock.text',
    defaultMessage:
      'In order to provide security for your own domain password, you can use a user token - to verify your account to be able to log with agent.',
  },
  regenerateSuccess: {
    id: 'AccessTokenBlock.regenerateSuccess',
    defaultMessage: 'Changes have been saved successfully',
  },
  regenerateError: {
    id: 'AccessTokenBlock.submitError',
    defaultMessage: "Error! Can't regenerate access token",
  },
});

@connect(
  (state) => ({
    token: apiTokenValueSelector(state),
  }),
  { showModalAction, generateApiTokenAction },
)
@injectIntl
@track()
export class AccessTokenBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    generateApiTokenAction: PropTypes.func.isRequired,
    token: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    token: '',
  };

  onGenerate = () => {
    this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.REGENERATE_BTN);
    this.props.showModalAction({
      id: 'regenerateAccessTokenModal',
      data: { onRegenerate: this.regenerateHandler },
    });
  };

  setupRef = (node) => {
    this.inputLink = node;
  };

  selectAccessToken = () => {
    this.inputLink.select();
  };

  regenerateHandler = () => {
    this.props.generateApiTokenAction({
      successMessage: this.props.intl.formatMessage(messages.regenerateSuccess),
      errorMessage: this.props.intl.formatMessage(messages.regenerateError),
    });
  };

  render = () => {
    const { intl } = this.props;
    return (
      <div className={cx('access-token-block')}>
        <BlockContainerHeader>
          <span className={cx('header-label')}>{intl.formatMessage(messages.header)}</span>
        </BlockContainerHeader>
        <BlockContainerBody>
          <div className={cx('body-wrapper')}>
            <div className={cx('field-wrapper')}>
              <span className={cx('label')}>{intl.formatMessage(messages.header)}</span>
              <div className={cx('field')}>
                <Input
                  readonly
                  value={this.props.token}
                  refFunction={this.setupRef}
                  onFocus={this.selectAccessToken}
                />
              </div>
              <div className={cx('regenerate-btn')}>
                <ButtonWithTooltip>
                  <GhostButton onClick={this.onGenerate}>
                    {intl.formatMessage(messages.regenerate)}
                  </GhostButton>
                </ButtonWithTooltip>
              </div>
            </div>
            <p className={cx('tip')}>{intl.formatMessage(messages.text)}</p>
          </div>
        </BlockContainerBody>
      </div>
    );
  };
}
