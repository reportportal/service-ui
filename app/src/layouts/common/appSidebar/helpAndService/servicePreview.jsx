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
import { ServicesContent } from 'layouts/common/appSidebar/helpAndService/servicesContent';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import ArrowRightIcon from '../img/arrow-right-inline.svg';
import styles from './servicePreview.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

const ServicePreview = ({ isFAQOpened }) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('service-preview')}>
      <div className={cx('content')}>
        <div className={cx('title')}>{formatMessage(messages.helpAndServiceVersions)}</div>
        <div className={cx('icon-container')}>
          {!isFAQOpened && <div className={cx('tooltip')} />}
          <div className={cx('arrow-icon')}>{Parser(ArrowRightIcon)}</div>
        </div>
      </div>
    </div>
  );
};

ServicePreview.propTypes = {
  isFAQOpened: PropTypes.bool,
};

export const ServiceWithPopover = withPopover({
  ContentComponent: ServicesContent,
  side: 'right',
  arrowVerticalPosition: 'vertical-bottom',
  popoverClassName: cx('popover'),
  popoverWrapperClassName: cx('popover-control'),
  variant: 'dark',
  tabIndex: 0,
  topPosition: window.innerHeight - 72,
})(ServicePreview);
