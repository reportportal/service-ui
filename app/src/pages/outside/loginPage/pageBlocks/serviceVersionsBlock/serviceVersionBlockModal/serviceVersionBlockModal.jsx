/*
 * Copyright 2022 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import { ModalLayout } from 'componentLibrary/modal';
import classNames from 'classnames/bind';
import { BigButton } from 'components/buttons/bigButton';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './serviceVersionsBlockModal.scss';
import { ServiceVersionsBlockWithTooltip } from '../serviceVersionBlockTooltip/serviceVersionsBlock';

const cx = classNames.bind(styles);

const FooterNode = ({ hideModal }) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('modal-footer-node')}>
      <BigButton roundedCorners color="organish" onClick={hideModal}>
        {formatMessage(COMMON_LOCALE_KEYS.CLOSE)}
      </BigButton>
    </div>
  );
};
FooterNode.propTypes = {
  hideModal: PropTypes.func.isRequired,
};

export const ServiceVersionsBlockModal = ({ services, hideModal }) => {
  return (
    <ModalLayout
      onClose={hideModal}
      overlay={'light-cyan'}
      className={cx('modal-window-mobile')}
      footerNode={<FooterNode hideModal={hideModal} />}
    >
      <ServiceVersionsBlockWithTooltip services={services} className={cx('tooltip-modal')} />
    </ModalLayout>
  );
};
ServiceVersionsBlockModal.propTypes = {
  services: PropTypes.object.isRequired,
  hideModal: PropTypes.func,
};
ServiceVersionsBlockModal.defaultProps = {
  hideModal: () => {},
};
