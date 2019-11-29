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
              {this.props.tweets.map((tweet) => (
                <PostBlock key={tweet.id} tweetData={tweet} />
              ))}
            </ScrollWrapper>
          </div>
        </div>
      </div>
    );
  }
}
