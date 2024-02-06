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

/* eslint-disable react/no-unknown-property */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { autocompleteVariantType } from '../propTypes';
import { AutocompleteOptions } from '../autocompleteOptions';
import styles from './autocompleteMenu.scss';

const cx = classNames.bind(styles);

const isReadyForSearch = (minLength, inputValue) =>
  !minLength || minLength <= inputValue.trim().length;

export const AutocompleteMenu = React.forwardRef(
  ({ isOpen, placement, style, minLength, inputValue, className, variant, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cx(
          'menu',
          variant,
          { opened: isOpen && isReadyForSearch(minLength, inputValue) },
          className,
        )}
        placement={placement}
        style={style}
      >
        <AutocompleteOptions inputValue={inputValue} variant={variant} {...props} />
      </ul>
    );
  },
);
AutocompleteMenu.propTypes = {
  isOpen: PropTypes.bool,
  placement: PropTypes.string,
  style: PropTypes.object,
  minLength: PropTypes.number,
  inputValue: PropTypes.string,
  className: PropTypes.string,
  variant: autocompleteVariantType,
};
AutocompleteMenu.defaultProps = {
  isOpen: false,
  placement: 'bottom-start',
  style: {},
  minLength: 1,
  inputValue: '',
  className: '',
  variant: 'light',
};
