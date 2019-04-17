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

import classNames from 'classnames/bind';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import styles from './newsBlock.scss';
import { PostBlock } from './postBlock';

const cx = classNames.bind(styles);

export class NewsBlock extends Component {
  static propTypes = {
    tweets: PropTypes.array,
  };

  static defaultProps = {
    tweets: [],
  };
  constructor(props) {
    super(props);
    window.addEventListener('resize', this.windowResizeHandler, false);
  }
  state = { twitterBlockHeight: window.innerWidth < 992 ? 160 : 500 };
  componentWillUnmount = () => {
    window.removeEventListener('resize', this.windowResizeHandler, false);
  };
  windowResizeHandler = (e) => {
    if (this.state.twitterBlockHeight === 500 && e.target.innerWidth < 992) {
      this.setState({ twitterBlockHeight: 160 });
    }
    if (this.state.twitterBlockHeight === 160 && e.target.innerWidth > 991) {
      this.setState({ twitterBlockHeight: 500 });
    }
  };

  render() {
    return (
      <div className={cx('news-block')}>
        <div className={cx('twitter-block')}>
          <div className={cx('twitter-title')}>
            <div className={cx('twitter-icon')} />
            <FormattedMessage
              id={'NewsBlock.twitterTitle'}
              defaultMessage={'Be informed with our latest tweets'}
            />
          </div>
          <div className={cx('twitter-news')}>
            <ScrollWrapper autoHeight autoHeightMax={this.state.twitterBlockHeight}>
              {Array.map(this.props.tweets, (tweet) => (
                <PostBlock key={tweet.id} tweetData={tweet} />
              ))}
            </ScrollWrapper>
          </div>
        </div>
      </div>
    );
  }
}
