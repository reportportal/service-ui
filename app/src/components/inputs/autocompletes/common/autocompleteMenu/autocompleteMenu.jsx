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
import { AutocompletePrompt } from './../autocompletePrompt';
import styles from './autocompleteMenu.scss';

const cx = classNames.bind(styles);

export const AutocompleteMenu = React.forwardRef(
  ({ isOpen, promptMessage, children: itemsList }, ref) => (
    <ul ref={ref} className={cx('menu', { opened: isOpen })}>
      <ScrollWrapper autoHeight autoHeightMax={300}>
        {isOpen &&
          (promptMessage ? <AutocompletePrompt>{promptMessage}</AutocompletePrompt> : itemsList)}
      </ScrollWrapper>
    </ul>
  ),
);

AutocompleteMenu.propTypes = {
  isOpen: PropTypes.bool,
  promptMessage: PropTypes.node,
  children: PropTypes.node,
};

AutocompleteMenu.defaultProps = {
  isOpen: false,
  children: null,
};
