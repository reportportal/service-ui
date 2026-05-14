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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Button } from '@reportportal/ui-kit';
import { HelpPanel } from 'pages/inside/common/helpPanel';
import { messages } from '../messages';
import styles from './qualityGatesPromoLayout.scss';
import bgImage from './img/quality-gates-bg.svg';

const cx = classNames.bind(styles);

export const QualityGatesPromoLayout = ({ showButton, onButtonClick, helpItems }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('promo-container')}>
      <span className={cx('title')}>{formatMessage(messages.promoTitle)}</span>
      <span className={cx('description')}>{formatMessage(messages.promoDescription)}</span>
      {showButton && (
        <div className={cx('create-button')}>
          <Button onClick={onButtonClick} data-automation-id="createQualityGateButton">
            {formatMessage(messages.createQualityGate)}
          </Button>
        </div>
      )}
      <img className={cx('bg-image')} src={bgImage} alt="" width="743" height="452" />
      <div className={cx('footer')}>
        <HelpPanel items={helpItems} />
      </div>
    </div>
  );
};

QualityGatesPromoLayout.propTypes = {
  helpItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  onButtonClick: PropTypes.func,
  showButton: PropTypes.bool,
};
