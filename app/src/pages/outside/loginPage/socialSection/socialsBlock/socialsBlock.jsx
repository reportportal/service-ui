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
