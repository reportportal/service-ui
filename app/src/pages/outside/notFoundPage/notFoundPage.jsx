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

import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { HOME_PAGE } from 'controllers/pages';
import { FormattedMessage } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import styles from './notFoundPage.scss';

const cx = classNames.bind(styles);
const RING_COUNT = 7;

@connect(null, { navigate: (linkAction) => linkAction })
export class NotFoundPage extends Component {
  static propTypes = {
    navigate: PropTypes.func.isRequired,
  };

  handleToHomeClick = () => {
    this.props.navigate({ type: HOME_PAGE });
  };

  renderRings = () => {
    const rings = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < RING_COUNT; i++) {
      rings.push(<div key={`round-${i}`} className={cx('round', `round-${i + 1}`)} />);
    }
    return rings;
  };

  render() {
    return (
      <Fragment>
        <header className={cx('header')}>
          <div className={cx('logo')} onClick={this.handleToHomeClick} />
        </header>
        <div className={cx('wrapper')}>
          <div className={cx('content-err-wrapper')}>
            {this.renderRings()}
            <div className={cx('stars', 'layer-1')} />
            <div className={cx('stars', 'layer-2')} />
            <div className={cx('orbit-rotation', 'round-center', 'red-planet')}>
              <div className={cx('self-rotation')} />
            </div>
            <div className={cx('orbit-rotation', 'round-center', 'saturn')}>
              <div className={cx('self-rotation')} />
            </div>
            <div className={cx('orbit-rotation', 'round-center', 'orange-planet')}>
              <div className={cx('self-rotation')} />
            </div>
            <div className={cx('rocket')} />
            <div className={cx('bones')} />
            <div className={cx('dog')} />
          </div>
          <div className={cx('content-err')}>
            <div className={cx('content-err-txt')}>
              <p className={cx('content-err-greeting')}>
                <FormattedMessage
                  id={'notFoundPage.oops'}
                  defaultMessage={'Oops. Looks like you have got lost.'}
                />
              </p>
              <p>
                <FormattedMessage
                  id={'notFoundPage.pageNotExist'}
                  defaultMessage={'The page you are looking for does not exist.'}
                />
              </p>
            </div>
            <div className={cx('content-action')}>
              <GhostButton onClick={this.handleToHomeClick}>
                <FormattedMessage
                  id={'notFoundPage.toHome'}
                  defaultMessage={'Get me out of here'}
                />
              </GhostButton>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
