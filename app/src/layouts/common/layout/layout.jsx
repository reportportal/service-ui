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
import { ScrollWrapper } from 'components/main/scrollWrapper';
import styles from './layout.scss';

const cx = classNames.bind(styles);

export class Layout extends Component {
  static propTypes = {
    children: PropTypes.node,
    Banner: PropTypes.elementType,
    Header: PropTypes.elementType,
    Sidebar: PropTypes.elementType,
    rawContent: PropTypes.bool,
    isExtensionPage: PropTypes.bool,
  };
  static defaultProps = {
    children: null,
    Banner: null,
    Header: null,
    Sidebar: null,
    rawContent: false,
    isExtensionPage: false,
  };

  state = {
    sideMenuOpened: false,
    resetScroll: false,
  };

  componentDidMount() {
    window.addEventListener('resize', this.windowResizeHandler, false);
  }

  componentDidUpdate(prevProps) {
    // reset the scroll state in case of new page content
    if (prevProps.children !== this.props.children) {
      this.markScrollToReset();
    }
  }

  markScrollToReset = () => {
    this.setState({
      resetScroll: true,
    });
  };

  unmarkScrollToReset = () => {
    this.setState({
      resetScroll: false,
    });
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResizeHandler, false);
  }

  windowResizeHandler = () => {
    if (this.state.sideMenuOpened && window.innerWidth > 767) {
      this.setState({ sideMenuOpened: false });
    }
  };

  toggleSideMenu = () => {
    this.setState({ sideMenuOpened: !this.state.sideMenuOpened });
  };

  render() {
    const { Header, Sidebar, Banner, rawContent, children } = this.props;
    const header = (
      <div className={cx('header-container')}>
        {Header && (
          <Header
            isSideMenuOpened={this.state.sideMenuOpened}
            toggleSideMenu={this.toggleSideMenu}
          />
        )}
      </div>
    );

    return (
      <div className={cx('layout')}>
        <div className={cx('slide-container', { 'side-menu-opened': this.state.sideMenuOpened })}>
          <div className={cx('sidebar-container')}>
            <div className={cx('corner-area')} />
            {Sidebar && (
              <Sidebar
                onClickNavBtn={() => {
                  this.state.sideMenuOpened && this.setState({ sideMenuOpened: false });
                }}
              />
            )}
          </div>
          <div className={cx('content')}>
            {Banner && <Banner />}
            {rawContent ? (
              <>
                {header}
                {children}
              </>
            ) : (
              <ScrollWrapper
                withBackToTop
                withFooter
                resetRequired={this.state.resetScroll}
                onReset={this.unmarkScrollToReset}
              >
                <div className={cx('scrolling-content')}>
                  {header}
                  <div
                    className={cx('page-container', {
                      'extension-page-container': this.props.isExtensionPage,
                    })}
                  >
                    {children}
                  </div>
                </div>
              </ScrollWrapper>
            )}
            <div
              className={cx('sidebar-close-area', { visible: this.state.sideMenuOpened })}
              onClick={this.toggleSideMenu}
            />
          </div>
        </div>
      </div>
    );
  }
}
