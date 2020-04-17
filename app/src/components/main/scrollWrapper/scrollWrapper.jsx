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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { FormattedMessage } from 'react-intl';
import { SpringSystem } from 'rebound';
import { Scrollbars } from 'react-custom-scrollbars';
import { FOOTER_EVENTS } from 'components/main/analytics/events';
import { forceCheck } from 'react-lazyload';
import { Footer } from 'layouts/common/footer';
import TopIcon from './img/top-inline.svg';
import styles from './scrollWrapper.scss';

const cx = classNames.bind(styles);

@track()
export class ScrollWrapper extends Component {
  static propTypes = {
    children: PropTypes.node,
    autoHide: PropTypes.bool,
    autoHeight: PropTypes.bool,
    autoHeightMin: PropTypes.number,
    autoHideTimeout: PropTypes.number,
    autoHeightMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    renderTrackHorizontal: PropTypes.func,
    renderTrackVertical: PropTypes.func,
    renderThumbHorizontal: PropTypes.func,
    renderThumbVertical: PropTypes.func,
    renderView: PropTypes.func,
    onLazyLoad: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    hideTracksWhenNotNeeded: PropTypes.bool,
    thumbMinSize: PropTypes.number,
    withBackToTop: PropTypes.bool,
    withFooter: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    children: null,
    autoHide: false,
    autoHeight: false,
    autoHeightMin: 0,
    autoHeightMax: '100%',
    autoHideTimeout: 500,
    renderTrackHorizontal: (props) => <div {...props} className={cx('track-horizontal')} />,
    renderTrackVertical: (props) => <div {...props} className={cx('track-vertical')} />,
    renderThumbHorizontal: (props) => <div {...props} className={cx('thumb-horizontal')} />,
    renderThumbVertical: (props) => <div {...props} className={cx('thumb-vertical')} />,
    renderView: ({ withFooter, ...props }) => (
      <div {...props} className={cx('scrolling-content', { 'with-footer': withFooter })} />
    ),
    onLazyLoad: false,
    hideTracksWhenNotNeeded: false,
    thumbMinSize: 30,
    withBackToTop: false,
    withFooter: false,
  };
  state = {
    showButton: false,
  };

  componentDidMount = () => {
    if (this.props.withBackToTop) {
      this.springSystem = new SpringSystem();
      this.spring = this.springSystem.createSpring();
      this.spring.addListener({ onSpringUpdate: this.handleSpringUpdate });
      this.stopScroll = false;
    }
  };

  componentWillUnmount = () => {
    if (this.props.withBackToTop) {
      this.springSystem.deregisterSpring(this.spring);
      this.springSystem.removeAllListeners();
      this.springSystem = undefined;
      this.spring.destroy();
      this.spring = undefined;
    }
  };

  getScrollTop = () => this.scrollbars.getScrollTop();

  getScrollHeight = () => this.scrollbars.getScrollHeight();

  getHeight = () => this.scrollbars.getHeight();

  setupRef = (scrollbars) => {
    this.scrollbars = scrollbars;
  };

  handleSpringUpdate = (spring) => {
    const val = spring.getCurrentValue();
    if (this.stopScroll) {
      return;
    } else if (val < 1) {
      this.scrollbars.scrollTop(0);
      this.stopScroll = true;
      return;
    }
    this.scrollbars.scrollTop(val);
  };

  scrollTop = () => {
    this.props.tracking.trackEvent(FOOTER_EVENTS.BACK_TO_TOP_CLICK);
    this.stopScroll = false;
    const scrollTop = this.scrollbars.getScrollTop();
    this.spring.setCurrentValue(scrollTop).setAtRest();
    this.spring.setEndValue(0);
  };

  handleScrollFrame = ({ scrollTop, scrollLeft, top }) => {
    const { lastViewScrollTop, lastViewScrollLeft } = this.scrollbars;
    const { withBackToTop, onLazyLoad } = this.props;

    const isBackToTopVisible = withBackToTop && scrollTop > 100;
    if (isBackToTopVisible !== this.state.showButton) {
      this.setState({ showButton: isBackToTopVisible });
    }

    if (onLazyLoad !== false && top > 0.9) {
      onLazyLoad();
    }
    if (scrollTop !== lastViewScrollTop) {
      this.scrollbars.thumbVertical.style.opacity = 1;
    }
    if (scrollLeft !== lastViewScrollLeft) {
      this.scrollbars.thumbHorizontal.style.opacity = 1;
    }
    forceCheck();
  };

  handleScrollStop = () => {
    this.scrollbars.thumbVertical.style.opacity = '';
    this.scrollbars.thumbHorizontal.style.opacity = '';
  };

  renderView = (props) => this.props.renderView({ withFooter: this.props.withFooter, ...props });

  render() {
    return (
      // base props are defined. For more info see https://github.com/malte-wessel/react-custom-scrollbars/blob/master/docs/API.md
      <Scrollbars
        ref={this.setupRef}
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
        renderView={this.renderView}
        hideTracksWhenNotNeeded={this.props.hideTracksWhenNotNeeded}
        thumbMinSize={this.props.thumbMinSize}
        onScrollFrame={this.handleScrollFrame}
        onScrollStop={this.handleScrollStop}
      >
        {this.props.children}
        {this.state.showButton && (
          <div className={cx('back-to-top')}>
            <button className={cx('back-to-top-button')} onClick={this.scrollTop}>
              <i className={cx('top-icon')}>{Parser(TopIcon)}</i>
              <FormattedMessage id="ScrollWrapper.backToTop" defaultMessage="Back to top" />
            </button>
          </div>
        )}
        {this.props.withFooter && <Footer />}
      </Scrollbars>
    );
  }
}
