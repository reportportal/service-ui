/*
 * Copyright 2019 EPAM Systems
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
import { ScrollWrapper } from 'components/main/scrollWrapper';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { AutocompleteOptions } from './../autocompleteOptions';
import { AutocompletePrompt } from './../autocompletePrompt';
import styles from './autocompleteMenu.scss';

const cx = classNames.bind(styles);

const isReadyForSearch = (minLength, inputValue) =>
  !minLength || minLength <= inputValue.trim().length;

const getBeforeSearchPrompt = (
  minLength,
  inputValue,
  beforeSearchPrompt,
  showDynamicSearchPrompt,
) => {
  if (beforeSearchPrompt) {
    return <AutocompletePrompt>{beforeSearchPrompt}</AutocompletePrompt>;
  }

  if (showDynamicSearchPrompt) {
    const diff = minLength - inputValue.trim().length;
    return (
      <AutocompletePrompt>
        <FormattedMessage
          id={'AsyncAutocomplete.dynamicSearchPromptText'}
          defaultMessage={'Please enter {length} or more characters'}
          values={{ length: diff }}
        />
      </AutocompletePrompt>
    );
  }
  return '';
};

export const AutocompleteMenu = React.forwardRef(
  (
    {
      isOpen,
      placement,
      style,
      minLength,
      inputValue,
      beforeSearchPrompt,
      showDynamicSearchPrompt,
      ...props
    },
    ref,
  ) => {
    const menuContent = !isReadyForSearch(minLength, inputValue) ? (
      getBeforeSearchPrompt(minLength, inputValue, beforeSearchPrompt, showDynamicSearchPrompt)
    ) : (
      <AutocompleteOptions inputValue={inputValue} {...props} />
    );

    return (
      <ul
        ref={ref}
        className={cx('menu', { opened: isOpen && menuContent })}
        placement={placement}
        style={style}
      >
        <ScrollWrapper autoHeight autoHeightMax={300}>
          {menuContent}
        </ScrollWrapper>
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
  beforeSearchPrompt: PropTypes.node,
  showDynamicSearchPrompt: PropTypes.bool,
};

AutocompleteMenu.defaultProps = {
  isOpen: false,
  placement: 'bottom-start',
  style: {},
  minLength: 1,
  inputValue: '',
  beforeSearchPrompt: null,
  showDynamicSearchPrompt: false,
};
