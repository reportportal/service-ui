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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Popover } from '@reportportal/ui-kit';

import { ServicesContent } from './servicesContent';
import { PreviewPopover } from './previewPopoverContent';

import styles from './previewPopover.scss';

const cx = classNames.bind(styles);

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
        strategy="fixed"
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
