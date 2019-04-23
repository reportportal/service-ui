import React, { Component } from 'react';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import ScreenShotIcon from 'common/img/screenshot-icon-inline.svg';
import { getTimeUnits } from 'common/utils';
import { messages } from '../../messages';
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
    screenShotLink: '',
    onItemClick: () => {},
  };

  state = {
    opened: false,
  };

  getCommandBlockConfig = () => {
    const {
      intl: { formatMessage },
      command: { method, path, request, result, HTTPStatus },
    } = this.props;

    const response = (
      <div>
        <div>HTTP status: {HTTPStatus}</div>
        {JSON.stringify(result)}
      </div>
    );

    return [
      {
        id: 'command',
        title: formatMessage(messages.commandTitle),
        content: `${method} ${path}`,
      },
      {
        id: 'parameters',
        title: formatMessage(messages.parametersTitle),
        content: `${JSON.stringify(request)}`,
      },
      {
        id: 'response',
        title: formatMessage(messages.responseTitle),
        content: response,
      },
    ];
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
      command: { method, path, request },
      screenShotLink,
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
              {Parser(ScreenShotIcon)}
            </a>
          </div>
        </div>
        {this.state.opened && (
          <div className={cx('command-item--content')}>
            {this.getCommandBlockConfig().map((item) => (
              <div key={item.id} className={cx('log-block-wrapper')}>
                <CommandItemLogBlock commandTitle={item.title} content={item.content} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
