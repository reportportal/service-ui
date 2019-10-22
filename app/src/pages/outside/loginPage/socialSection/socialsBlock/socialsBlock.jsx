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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events';
import { referenceDictionary } from 'common/utils';
import styles from './socialsBlock.scss';

const cx = classNames.bind(styles);

@track()
export class SocialsBlock extends Component {
  static propTypes = {
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  render() {
    const { tracking } = this.props;
    return (
      <div className={cx('socials-block')}>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_GITHUB_ICON)}
          href={referenceDictionary.rpGitHub}
          target="_blank"
          className={cx('social-link', 'gh-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_FACEBOOK_ICON)}
          href={referenceDictionary.rpFacebook}
          target="_blank"
          className={cx('social-link', 'fb-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_TWEETER_ICON)}
          href={referenceDictionary.rpTwitter}
          target="_blank"
          className={cx('social-link', 'tw-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_YOUTUBE_ICON)}
          href={referenceDictionary.rpYoutube}
          target="_blank"
          className={cx('social-link', 'yt-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_VK_ICON)}
          href={referenceDictionary.rpVk}
          target="_blank"
          className={cx('social-link', 'vk-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_SLACK_ICON)}
          href={referenceDictionary.rpSlack}
          target="_blank"
          className={cx('social-link', 'slk-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_MAIL_ICON)}
          href={referenceDictionary.rpEmail}
          target="_blank"
          className={cx('social-link', 'mail-icon')}
        >
          {}
        </a>
      </div>
    );
  }
}
