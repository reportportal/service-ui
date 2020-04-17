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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { FOOTER_EVENTS } from 'components/main/analytics/events';
import { uiBuildVersionSelector } from 'controllers/appInfo';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import styles from './footer.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  buildVersion: uiBuildVersionSelector(state),
}))
@track()
export class Footer extends Component {
  static propTypes = {
    buildVersion: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  render() {
    const { buildVersion, tracking } = this.props;
    return (
      <footer className={cx('footer')}>
        <div className={cx('footer-links')}>
          <a
            href={referenceDictionary.rpGitHub}
            target="_blank"
            onClick={() => tracking.trackEvent(FOOTER_EVENTS.FORK_US_CLICK)}
          >
            <FormattedMessage id={'Footer.git'} defaultMessage={'Fork us on GitHub'} />
          </a>
          <a
            href={referenceDictionary.rpSlack}
            target="_blank"
            onClick={() => tracking.trackEvent(FOOTER_EVENTS.SLACK_LINK)}
          >
            <FormattedMessage id={'Footer.slack'} defaultMessage={'Chat with us on Slack'} />
          </a>
          <a
            href={referenceDictionary.rpEmail}
            onClick={() => tracking.trackEvent(FOOTER_EVENTS.CONTACT_US_LINK)}
          >
            <FormattedMessage id={'Footer.contact'} defaultMessage={'Contact us'} />
          </a>
          <a
            href={referenceDictionary.rpEpam}
            target="_blank"
            onClick={() => tracking.trackEvent(FOOTER_EVENTS.EPAM_LINK)}
          >
            EPAM
          </a>
          <a
            href={referenceDictionary.rpDoc}
            target="_blank"
            onClick={() => tracking.trackEvent(FOOTER_EVENTS.DOCUMENTATION_LINK)}
          >
            <FormattedMessage id={'Footer.documentation'} defaultMessage={'Documentation'} />
          </a>
        </div>
        <div className={cx('text-wrapper')}>
          <div className={cx('footer-text')}>
            <FormattedMessage id={'Footer.build'} defaultMessage={'Build'} />
            <span>: {buildVersion}</span>
          </div>
          <div className={cx('footer-text')}>
            <span> &copy; Report Portal 2018 </span>
            <FormattedMessage id={'Footer.copyright'} defaultMessage={'All rights reserved'} />
          </div>
        </div>
      </footer>
    );
  }
}
