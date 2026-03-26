/*!
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

import { useState } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { BaseIconButton, Popover } from '@reportportal/ui-kit';
import TreeIcon from './img/tree-inline.svg';
import { PopoverContent } from './popoverContent/popoverContent';
import styles from './userPageLocationLevel.scss';

const cx = classNames.bind(styles);

export const UserPageLocationLevel = ({ descriptors }) => {
  const [isOpen, setIsOpen] = useState(false);
  const lastDescriptor = descriptors[descriptors.length - 1];

  return (
    <div className={cx('user-page-location-level')}>
      <Popover
        content={<PopoverContent descriptors={descriptors} />}
        placement="bottom-start"
        className={cx('popover')}
        isOpened={isOpen}
        setIsOpened={setIsOpen}
        fallbackPlacements={[]}
      >
        <BaseIconButton className={cx('tree-button', { open: isOpen })}>
          {Parser(TreeIcon)}
        </BaseIconButton>
      </Popover>
      <div className={cx('name')}>{lastDescriptor.title}</div>
    </div>
  );
};

UserPageLocationLevel.propTypes = {
  descriptors: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      link: PropTypes.shape({
        type: PropTypes.string.isRequired,
        payload: PropTypes.object,
      }),
    })
  ).isRequired,
};

UserPageLocationLevel.defaultProps = {
  projectName: null,
};
