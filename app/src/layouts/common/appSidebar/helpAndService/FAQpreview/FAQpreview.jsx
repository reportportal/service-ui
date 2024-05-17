/*
 * Copyright 2024 EPAM Systems
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

import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { messages } from 'layouts/common/appSidebar/helpAndService/messages';
import Parser from 'html-react-parser';
import ArrowRightIcon from 'layouts/common/appSidebar/img/arrow-right-inline.svg';
import { withPopover } from 'componentLibrary/popover';
import PropTypes from 'prop-types';
import React from 'react';
import { FAQContent } from '../FAQcontent';
import styles from './FAQpreview.scss';

const cx = classNames.bind(styles);
const FAQpreview = ({ isFAQOpened }) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('FAQ-preview')}>
      <div className={cx('content')}>
        <div className={cx('title')}>{formatMessage(messages.FAQ)}</div>
        <div className={cx('icon-container')}>
          {!isFAQOpened && <div className={cx('tooltip')} />}
          <div className={cx('arrow-icon')}>{Parser(ArrowRightIcon)}</div>
        </div>
      </div>
    </div>
  );
};

export const FAQWithPopover = withPopover({
  ContentComponent: FAQContent,
  side: 'right',
  arrowVerticalPosition: 'vertical-top',
  popoverClassName: cx('popover'),
  popoverWrapperClassName: cx('popover-control'),
  variant: 'dark',
  tabIndex: 0,
  topPosition: 1,
})(FAQpreview);

FAQpreview.propTypes = {
  isFAQOpened: PropTypes.bool,
};
