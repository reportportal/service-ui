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
  slack: 'Slack',
  x: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  mail: 'Email',
  github: 'GitHub',
};

const socialAnalyticsNames = {
  slack: 'slack',
  x: 'twitter',
  linkedin: 'linkedin',
  youtube: 'youtube',
  mail: 'mail',
  github: 'github',
};

const socialLinks = [
  { key: 'slack', href: referenceDictionary.rpSlack, className: 'slk-icon', external: true },
  { key: 'x', href: referenceDictionary.rpTwitter, className: 'tw-icon', external: true },
  { key: 'linkedin', href: referenceDictionary.rpLinkedin, className: 'linkedin-icon', external: true },
  { key: 'youtube', href: referenceDictionary.rpYoutube, className: 'yt-icon', external: true },
  { key: 'mail', href: referenceDictionary.rpEmail, className: 'mail-icon', external: false },
  { key: 'github', href: referenceDictionary.rpGitHub, className: 'gh-icon', external: true },
];

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
        {socialLinks.map(({ key, href, className, external }) => (
          <a
            key={key}
            href={href}
            aria-label={socials[key]}
            title={socials[key]}
            onClick={() =>
              tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnSocialIcon(socialAnalyticsNames[key]))
            }
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={cx('social-link', className)}
          />
        ))}
      </div>
    );
  }
}
