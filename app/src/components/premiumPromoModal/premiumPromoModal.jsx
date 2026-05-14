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
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Button, ExternalLinkIcon, Modal } from '@reportportal/ui-kit';
import LogoWhite from 'common/img/logo-white.svg';
import { hideModalAction } from 'controllers/modal';
import { messages } from './messages';
import styles from './premiumPromoModal.scss';

const cx = classNames.bind(styles);

const DEFAULT_FEATURE_MESSAGES = [
  messages.premiumBulletQualityGates,
  messages.premiumBulletOrganizations,
  messages.premiumBulletTestExecutions,
  messages.premiumBulletSSO,
  messages.premiumBulletMore,
];

const messageDescriptorPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
});

export const PremiumPromoModal = ({
  titleMessage,
  subtitleMessage,
  featureMessages,
  explorePlansLabelMessage,
  contactUsLabelMessage,
  notNowLabelMessage,
  onExplorePlans,
  onContactUs,
  onNotNow,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const previouslyFocusedElementRef = useRef(null);

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

  const modalTitle = <img className={cx('logo')} src={LogoWhite} alt="ReportPortal" />;

  return (
    <Modal
      className={cx('premium-promo-modal')}
      title={modalTitle}
      onClose={handleClose}
      footerNode={
        <Button
          className={cx('not-now-button')}
          variant="text"
          onClick={() => {
            onNotNow?.();
            handleClose();
          }}
        >
          {formatMessage(notNowLabelMessage)}
        </Button>
      }
      cancelButton={{
        children: formatMessage(contactUsLabelMessage),
        variant: 'ghost',
        icon: <ExternalLinkIcon />,
        iconPlace: 'end',
        onClick: () => onContactUs?.(),
      }}
      okButton={{
        children: formatMessage(explorePlansLabelMessage),
        icon: <ExternalLinkIcon />,
        iconPlace: 'end',
        onClick: () => onExplorePlans?.(),
      }}
    >
      <div className={cx('modal-content')}>
        <h2 className={cx('title')}>{formatMessage(titleMessage)}</h2>
        <p className={cx('subtitle')}>{formatMessage(subtitleMessage)}</p>
        <ul className={cx('feature-list')}>
          {featureMessages.map((featureMessage) => (
            <li key={featureMessage.id} className={cx('feature-item')}>
              {formatMessage(featureMessage)}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

PremiumPromoModal.propTypes = {
  titleMessage: messageDescriptorPropType,
  subtitleMessage: messageDescriptorPropType,
  featureMessages: PropTypes.arrayOf(messageDescriptorPropType),
  explorePlansLabelMessage: messageDescriptorPropType,
  contactUsLabelMessage: messageDescriptorPropType,
  notNowLabelMessage: messageDescriptorPropType,
  onExplorePlans: PropTypes.func,
  onContactUs: PropTypes.func,
  onNotNow: PropTypes.func,
};

PremiumPromoModal.defaultProps = {
  titleMessage: messages.premiumPopupTitle,
  subtitleMessage: messages.premiumPopupSubtitle,
  featureMessages: DEFAULT_FEATURE_MESSAGES,
  explorePlansLabelMessage: messages.explorePlansButton,
  contactUsLabelMessage: messages.contactUsButton,
  notNowLabelMessage: messages.notNowButton,
};