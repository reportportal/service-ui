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

import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { withPopover } from 'componentLibrary/popover';
import PropTypes from 'prop-types';
import React from 'react';
import { FAQContent } from 'layouts/common/appSidebar/helpAndService/FAQcontent';
import HelpIcon from 'common/img/help-inline.svg';
import { ServicesContent } from './servicesContent';
import ArrowRightIcon from '../img/arrow-right-inline.svg';
import styles from './previewPopover.scss';

const cx = classNames.bind(styles);

function PreviewPopover({ title, isFaqTouched, onClick }) {
  return (
    <div className={cx('service-wrapper')} onClick={onClick}>
      <button className={cx('service-block', { untouched: !isFaqTouched })}>
        <i>{Parser(HelpIcon)}</i>
      </button>
      <button className={cx('service-control')}>
        <div className={cx('preview')}>
          <div className={cx('content')}>
            <span className={cx('title')}>{title}</span>
            <div className={cx('arrow-icon', { untouched: !isFaqTouched })}>
              {Parser(ArrowRightIcon)}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

PreviewPopover.propTypes = {
  isFaqTouched: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export const ServiceWithPopover = withPopover({
  ContentComponent: ServicesContent,
  side: 'right',
  arrowVerticalPosition: 'vertical-bottom',
  popoverClassName: cx('service-popover'),
  popoverWrapperClassName: cx('service-popover-control'),
  variant: 'dark',
  tabIndex: 0,
  topPosition: 'auto',
  arrowVerticalOffset: 16,
})(PreviewPopover);

export const FAQWithPopover = withPopover({
  ContentComponent: FAQContent,
  side: 'right',
  arrowVerticalPosition: 'vertical-top',
  popoverClassName: cx('faq-popover'),
  popoverWrapperClassName: cx('faq-popover-control'),
  variant: 'dark',
  tabIndex: 0,
  topPosition: 1,
  arrowVerticalOffset: 16,
})(PreviewPopover);
