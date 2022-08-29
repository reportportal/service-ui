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
import classNames from 'classnames/bind';
import { Button } from 'componentLibrary/button';
import PlusIcon from 'common/img/plus-button-inline.svg';
import styles from './autocompleteOption.scss';

const cx = classNames.bind(styles);

export const AutocompleteOption = ({
  isActive,
  isSelected,
  children,
  isNew,
  disabled,
  variant,
  ...props
}) => {
  return isNew ? (
    <>
      <div className={cx('divider')} />
      <li
        className={cx('new-item', variant, { active: isActive, selected: isSelected, disabled })}
        {...props}
      >
        <span className={cx('value')}>{children}</span>
        <Button {...(!disabled ? props : {})} startIcon={PlusIcon} variant={'text'}>
          {variant === 'key-variant' ? 'New key' : 'New value'}
        </Button>
      </li>
    </>
  ) : (
    <li
      className={cx('item', variant, { active: isActive, selected: isSelected, disabled })}
      {...(!disabled ? props : {})}
    >
      <span className={cx('label', 'tag')}>{children}</span>
    </li>
  );
};

AutocompleteOption.propTypes = {
  isActive: PropTypes.bool,
  isSelected: PropTypes.bool,
  isNew: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  variant: PropTypes.string,
};

AutocompleteOption.defaultProps = {
  isActive: false,
  isSelected: false,
  isNew: false,
  children: null,
  disabled: false,
  variant: '',
};
