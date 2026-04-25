/*
 * Copyright 2026 EPAM Systems
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
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Modal } from '@reportportal/ui-kit';
import LogoWhite from 'common/img/logo-white.svg';
import OpenInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { hideModalAction } from 'controllers/modal';
import { messages } from '../messages';
import styles from './premiumPromoModal.scss';

const cx = classNames.bind(styles);

const PREMIUM_FEATURES = [
  messages.premiumBulletQualityGates,
  messages.premiumBulletOrganizations,
  messages.premiumBulletTestExecutions,
  messages.premiumBulletSSO,
  messages.premiumBulletMore,
];

export const PremiumPromoModal = ({ onExplorePlans, onContactUs, onNotNow }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const previouslyFocusedElementRef = useRef(null);

  // Save the element that triggered the modal so focus can be restored on close.
  useEffect(() => {
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      const target = previouslyFocusedElementRef.current;
      if (target && typeof target.focus === 'function') {
        target.focus();
      }
    };
  }, []);

  const handleClose = () => dispatch(hideModalAction());

  const handleExplorePlans = () => {
    onExplorePlans?.();
  };

  const handleContactUs = () => {
    onContactUs?.();
  };

  const renderFooter = (closeHandler) => (
    <div className={cx('modal-footer')}>
      <a
        className={cx('contact-us-btn')}
        href={referenceDictionary.rpContactUs}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleContactUs}
      >
        {formatMessage(messages.contactUsButton)}
      </a>
      <button
        type="button"
        className={cx('not-now-btn')}
        onClick={() => {
          onNotNow?.();
          closeHandler();
        }}
      >
        {formatMessage(messages.notNowButton)}
      </button>
      <a
        className={cx('explore-plans-btn')}
        href={referenceDictionary.rpExplorePlans}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleExplorePlans}
      >
        {formatMessage(messages.explorePlansButton)}
        <span className={cx('external-link-icon')}>{Parser(OpenInNewTabIcon)}</span>
      </a>
    </div>
  );

  return (
    <Modal
      className={cx('premium-promo-modal')}
      onClose={handleClose}
      allowCloseOutside={false}
      createFooter={renderFooter}
    >
      <div className={cx('modal-content')}>
        <img className={cx('logo')} src={LogoWhite} alt="ReportPortal" />
        <h2 className={cx('title')}>{formatMessage(messages.premiumPopupTitle)}</h2>
        <p className={cx('subtitle')}>{formatMessage(messages.premiumPopupSubtitle)}</p>
        <ul className={cx('feature-list')}>
          {PREMIUM_FEATURES.map((feature) => (
            <li key={feature.id} className={cx('feature-item')}>
              {formatMessage(feature)}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

PremiumPromoModal.propTypes = {
  onExplorePlans: PropTypes.func,
  onContactUs: PropTypes.func,
  onNotNow: PropTypes.func,
};
