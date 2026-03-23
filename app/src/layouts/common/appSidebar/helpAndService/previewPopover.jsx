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

import { Popover } from '@reportportal/ui-kit';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FAQContent } from 'layouts/common/appSidebar/helpAndService/FAQcontent';
import HelpIcon from 'common/img/help-inline.svg';
import { ServicesContent } from './servicesContent';
import ArrowRightIcon from '../img/arrow-right-inline.svg';
import styles from './previewPopover.scss';

const cx = classNames.bind(styles);

const PreviewPopover = ({ title, isFaqTouched, onClick }) => {
  return (
    <button className={cx('service-wrapper')} onClick={onClick} tabIndex={0}>
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
    </button>
  );
};

PreviewPopover.propTypes = {
  isFaqTouched: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export const ServiceWithPopover = ({
  title,
  isFaqTouched,
  isOpenPopover,
  closeSidebar,
  onClick,
  onOpen,
  togglePopover,
}) => {
  const closePopover = () => {
    togglePopover(false);
  };

  return (
    <div className={cx('service-popover-control')}>
      <Popover
        className={cx('service-popover')}
        placement="right-end"
        isOpened={isOpenPopover}
        setIsOpened={togglePopover}
        content={
          <ServicesContent
            isFaqTouched={isFaqTouched}
            closePopover={closePopover}
            closeSidebar={closeSidebar}
            onOpen={onOpen}
          />
        }
      >
        <PreviewPopover title={title} isFaqTouched={isFaqTouched} onClick={onClick} />
      </Popover>
    </div>
  );
};

ServiceWithPopover.propTypes = {
  title: PropTypes.string.isRequired,
  isFaqTouched: PropTypes.bool.isRequired,
  isOpenPopover: PropTypes.bool.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  togglePopover: PropTypes.func.isRequired,
};

export const FAQWithPopover = ({ title, isFaqTouched, closePopover, closeSidebar, onOpen }) => {
  return (
    <div className={cx('faq-popover-control')}>
      <Popover
        className={cx('faq-popover')}
        placement="right-start"
        content={
          <FAQContent closePopover={closePopover} closeSidebar={closeSidebar} onOpen={onOpen} />
        }
      >
        <PreviewPopover title={title} isFaqTouched={isFaqTouched} />
      </Popover>
    </div>
  );
};

FAQWithPopover.propTypes = {
  title: PropTypes.string.isRequired,
  isFaqTouched: PropTypes.bool.isRequired,
  closePopover: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};
