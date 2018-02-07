/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './scrollWrapper.scss';

const cx = classNames.bind(styles);

export class ScrollWrapper extends Component {
  static propTypes = {
    children: PropTypes.node,
    autoHide: PropTypes.bool,
    autoHeight: PropTypes.bool,
    autoHeightMin: PropTypes.number,
    autoHideTimeout: PropTypes.number,
    autoHeightMax: PropTypes.number,
    renderTrackHorizontal: PropTypes.func,
    renderTrackVertical: PropTypes.func,
    renderThumbHorizontal: PropTypes.func,
    renderThumbVertical: PropTypes.func,
    renderView: PropTypes.func,
    hideTracksWhenNotNeeded: PropTypes.bool,
    thumbMinSize: PropTypes.number,
  };
  static defaultProps = {
    children: {},
    autoHide: false,
    autoHeight: false,
    autoHeightMin: 0,
    autoHeightMax: 200,
    autoHideTimeout: 500,
    renderTrackHorizontal: props => <div {...props} className={cx('track-horizontal')} />,
    renderTrackVertical: props => <div {...props} className={cx('track-vertical')} />,
    renderThumbHorizontal: props => <div {...props} className={cx('thumb-horizontal')} />,
    renderThumbVertical: props => <div {...props} className={cx('thumb-vertical')} />,
    renderView: props => <div {...props} className={cx('scrolling-content')} />,
    hideTracksWhenNotNeeded: false,
    thumbMinSize: 30,
  };

  handleScrollFrame = (values) => {
    if (values.scrollTop !== this.scrollbars.lastViewScrollTop) {
      this.scrollbars.thumbVertical.style.opacity = 1;
    }
    if (values.scrollLeft !== this.scrollbars.lastViewScrollLeft) {
      this.scrollbars.thumbHorizontal.style.opacity = 1;
    }
  };
  handleScrollStop = () => {
    this.scrollbars.thumbVertical.style.opacity = '';
    this.scrollbars.thumbHorizontal.style.opacity = '';
  };

  render() {
    return ( // base props are defined. For more info see https://github.com/malte-wessel/react-custom-scrollbars/blob/master/docs/API.md
      <Scrollbars
        ref={(scrollbars) => { this.scrollbars = scrollbars; }}
        className={cx('scroll-component')}
        autoHide={this.props.autoHide}
        autoHeight={this.props.autoHeight}
        autoHeightMin={this.props.autoHeightMin}
        autoHeightMax={this.props.autoHeightMax}
        autoHideTimeout={this.props.autoHideTimeout}
        renderTrackHorizontal={this.props.renderTrackHorizontal}
        renderTrackVertical={this.props.renderTrackVertical}
        renderThumbHorizontal={this.props.renderThumbHorizontal}
        renderThumbVertical={this.props.renderThumbVertical}
        renderView={this.props.renderView}
        hideTracksWhenNotNeeded={this.props.hideTracksWhenNotNeeded}
        thumbMinSize={this.props.thumbMinSize}

        onScrollFrame={this.handleScrollFrame}
        onScrollStop={this.handleScrollStop}
      >
        { this.props.children }
      </Scrollbars>
    );
  }
}
