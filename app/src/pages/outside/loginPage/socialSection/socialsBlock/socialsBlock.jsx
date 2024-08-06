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
import { referenceDictionary } from 'common/utils';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import styles from './socialsBlock.scss';

const cx = classNames.bind(styles);

const socials = {
  github: 'GitHub',
  facebook: 'Facebook',
  twitter: 'Twitter',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  slack: 'Slack',
  mail: 'mail',
};

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
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socials.github))}
          href={referenceDictionary.rpGitHub}
          target="_blank"
          className={cx('social-link', 'gh-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socials.facebook))}
          href={referenceDictionary.rpFacebook}
          target="_blank"
          className={cx('social-link', 'fb-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socials.twitter))}
          href={referenceDictionary.rpTwitter}
          target="_blank"
          className={cx('social-link', 'tw-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socials.youtube))}
          href={referenceDictionary.rpYoutube}
          target="_blank"
          className={cx('social-link', 'yt-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socials.linkedin))}
          href={referenceDictionary.rpLinkedin}
          target="_blank"
          className={cx('social-link', 'linkedin-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socials.slack))}
          href={referenceDictionary.rpSlack}
          target="_blank"
          className={cx('social-link', 'slk-icon')}
        >
          {}
        </a>
        <a
          onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socials.mail))}
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
