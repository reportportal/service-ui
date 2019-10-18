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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import {
  sauceLabsLogsSelector,
  sauceLabsAuthTokenSelector,
  sauceLabsAssetsSelector,
} from 'controllers/log/sauceLabs';
import { ContainerWithTabs } from 'components/main/containerWithTabs';
import { COMMANDS_TAB, METADATA_TAB, LOGS_TAB } from './constants';
import { messages } from './messages';
import { CommandsContent } from './commandsContent';
import { LogsContent } from './logsContent';
import { MetadataContent } from './metadataContent';
import styles from './jobInfoSection.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  logs: sauceLabsLogsSelector(state),
  assets: sauceLabsAssetsSelector(state),
  authToken: sauceLabsAuthTokenSelector(state),
}))
@injectIntl
export class JobInfoSection extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    logs: PropTypes.array,
    assets: PropTypes.object,
    authToken: PropTypes.string,
    observer: PropTypes.object,
    isFullscreenMode: PropTypes.bool,
  };

  static defaultProps = {
    logs: [],
    assets: {},
    authToken: '',
    observer: {},
    isFullscreenMode: false,
  };

  getTabsConfig = () => {
    const {
      intl: { formatMessage },
      authToken,
      logs,
      assets,
      observer,
      isFullscreenMode,
    } = this.props;
    const isLogsAvailable = !!logs.length;
    const commandsTab = {
      name: formatMessage(messages[COMMANDS_TAB]),
      content: (
        <CommandsContent
          authToken={authToken}
          commands={logs}
          assets={assets}
          observer={observer}
          isFullscreenMode={isFullscreenMode}
        />
      ),
    };

    return isLogsAvailable
      ? [
          commandsTab,
          {
            name: formatMessage(messages[LOGS_TAB]),
            content: (
              <LogsContent
                logs={logs}
                assets={assets}
                authToken={authToken}
                isFullscreenMode={isFullscreenMode}
              />
            ),
          },
          {
            name: formatMessage(messages[METADATA_TAB]),
            content: (
              <MetadataContent
                assets={assets}
                authToken={authToken}
                isFullscreenMode={isFullscreenMode}
              />
            ),
          },
        ]
      : [commandsTab];
  };

  render() {
    return (
      <div className={cx('job-info-section')}>
        <ContainerWithTabs data={this.getTabsConfig()} customClass={cx('section-header')} />
      </div>
    );
  }
}
