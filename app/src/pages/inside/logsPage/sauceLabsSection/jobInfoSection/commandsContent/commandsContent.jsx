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
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoItemMessage } from 'components/main/noItemMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { buildAssetLink, getCommandBlockConfig } from '../utils';
import { RESPONSE_FIELD } from '../constants';
import { FiltersBlock } from './filtersBlock';
import { CommandItem } from './commandItem';
import styles from './commandsContent.scss';

const cx = classNames.bind(styles);

@injectIntl
export class CommandsContent extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    commands: PropTypes.array,
    assets: PropTypes.object,
    authToken: PropTypes.string,
    observer: PropTypes.object,
    isFullscreenMode: PropTypes.bool,
  };

  static defaultProps = {
    commands: [],
    assets: {},
    authToken: '',
    observer: {},
    isFullscreenMode: false,
  };

  state = {
    hasScreenshot: false,
    commandsSearchValue: '',
  };

  onCommandItemClick = (time) => () => {
    this.props.observer.publish('goToVideoTimeline', time);
  };

  onToggleHasScreenshot = () => {
    this.setState({
      hasScreenshot: !this.state.hasScreenshot,
    });
  };

  onChangeCommandsSearch = (event) => {
    this.setState({
      commandsSearchValue: event.target.value,
    });
  };

  getFilteredCommands = () => {
    let { commands: filteredFommands } = this.props;
    const { hasScreenshot, commandsSearchValue } = this.state;

    if (hasScreenshot) {
      filteredFommands = filteredFommands.filter((item) => typeof item.screenshot === 'number');
    }

    if (commandsSearchValue) {
      filteredFommands = filteredFommands.filter((item) => {
        const commandParts = getCommandBlockConfig(item);
        return commandParts.some(({ id, content = '' }) => {
          const data = id === RESPONSE_FIELD ? JSON.stringify(item.result) : content;
          return data.indexOf(commandsSearchValue) !== -1;
        });
      });
    }

    return filteredFommands;
  };

  buildScreenShotLink = ({ screenshot: screenshotId } = {}) => {
    const {
      assets: { assetsPrefix, screenshots = [] },
      authToken,
    } = this.props;
    return typeof screenshotId === 'number'
      ? buildAssetLink(assetsPrefix, screenshots[screenshotId], authToken)
      : null;
  };

  render() {
    const {
      intl: { formatMessage },
      isFullscreenMode,
    } = this.props;
    const { hasScreenshot, commandsSearchValue } = this.state;
    const filteredCommands = this.getFilteredCommands();

    return (
      <div className={cx('commands-content')}>
        <FiltersBlock
          hasScreenshot={hasScreenshot}
          searchValue={commandsSearchValue}
          onToggleHasScreenshot={this.onToggleHasScreenshot}
          onChangeSearch={this.onChangeCommandsSearch}
        />
        {filteredCommands.length ? (
          <ScrollWrapper
            autoHeight
            autoHeightMax={isFullscreenMode ? '100%' : 570}
            hideTracksWhenNotNeeded
            autoHide
          >
            {filteredCommands.map((item) => (
              <CommandItem
                key={item.start_time}
                command={item}
                onItemClick={this.onCommandItemClick(item.in_video_timeline + item.duration)}
                screenShotLink={this.buildScreenShotLink(item)}
              />
            ))}
          </ScrollWrapper>
        ) : (
          <NoItemMessage message={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
        )}
      </div>
    );
  }
}
