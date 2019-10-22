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
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './ownerBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  ownerTitle: {
    id: 'OwnerBlock.ownerTitle',
    defaultMessage: 'Owner',
  },
});

export const OwnerBlock = injectIntl(({ intl, owner, disabled, onClick }) => {
  const clickHandler = () => {
    onClick(owner);
  };
  return (
    <div
      className={cx('owner-block', { disabled })}
      title={intl.formatMessage(messages.ownerTitle)}
      onClick={clickHandler}
    >
      <div className={cx('owner-icon')} />
      <span className={cx('owner')}>{owner}</span>
    </div>
  );
});

OwnerBlock.propTypes = {
  owner: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

OwnerBlock.defaultProps = {
  disabled: false,
  onClick: () => {},
};
