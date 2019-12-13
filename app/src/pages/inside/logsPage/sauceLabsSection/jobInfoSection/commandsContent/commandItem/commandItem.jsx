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
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import ScreenShotIcon from 'common/img/screenshot-icon-inline.svg';
import { getTimeUnits } from 'common/utils';
import { getCommandBlockConfig } from '../../utils';
import { CommandItemLogBlock } from './commandItemLogBlock';
import styles from './commandItem.scss';

const cx = classNames.bind(styles);

@injectIntl
export class CommandItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    command: PropTypes.object,
    screenShotLink: PropTypes.string,
    onItemClick: PropTypes.func,
  };

  static defaultProps = {
    command: {},
    screenShotLink: null,
    onItemClick: () => {},
  };

  state = {
    opened: false,
  };

  getFormattedUnit = (item) => {
    const itemString = item.toString();
    return itemString.length > 1 ? itemString : `0${itemString}`;
  };

  getCommandItemTime = () => {
    const {
      command: { in_video_timeline: inVideoTimeLine, duration },
    } = this.props;
    const commandTime = inVideoTimeLine + duration;
    const { minutes, seconds, milliseconds } = getTimeUnits(commandTime > 0 ? commandTime : 0);

    return `${this.getFormattedUnit(minutes)}:${this.getFormattedUnit(
      Math.trunc(seconds),
    )}:${this.getFormattedUnit(milliseconds)}`;
  };

  contentControlRef = React.createRef();

  toggleShowContent = () =>
    this.setState({
      opened: !this.state.opened,
    });

  commandItemClickHandler = (event) => {
    if (
      this.contentControlRef &&
      (event.target === this.contentControlRef.current ||
        this.contentControlRef.current.contains(event.target))
    ) {
      return;
    }
    this.props.onItemClick();
  };

  render() {
    const {
      intl: { formatMessage },
      command: { method, path, request },
      screenShotLink,
      command,
    } = this.props;
    const isUrlRequest = request && request.url;

    return (
      <div className={cx('command-item')} onClick={this.commandItemClickHandler}>
        <div className={cx('command-item--header', { opened: this.state.opened })}>
          <div className={cx('content-part-wrapper', 'left')}>
            <div
              ref={this.contentControlRef}
              className={cx('opened-control')}
              onClick={this.toggleShowContent}
            >
              {Parser(ArrowIcon)}
            </div>
            <div className={cx('time-column')}>{this.getCommandItemTime()}</div>
            <div className={cx('method-column')}>{isUrlRequest ? 'Load url' : method}</div>
            <div className={cx('path-column')}>{isUrlRequest || path}</div>
          </div>
          <div className={cx('content-part-wrapper')}>
            <a target="_blank" href={screenShotLink} className={cx('screenshot-column')}>
              {screenShotLink && Parser(ScreenShotIcon)}
            </a>
          </div>
        </div>
        {this.state.opened && (
          <div className={cx('command-item--content')}>
            {getCommandBlockConfig(command).map((item) => (
              <div key={item.id} className={cx('log-block-wrapper')}>
                <CommandItemLogBlock
                  commandTitle={formatMessage(item.title)}
                  content={item.content}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
