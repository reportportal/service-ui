/*
 * Copyright 2025 EPAM Systems
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
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from '@reportportal/ui-kit';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import IconTick from 'common/img/newIcons/tick-inline.svg';
import styles from './copyClipboardButton.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  copyToClipboard: {
    id: 'ClipboardButton.copyToClipboard',
    defaultMessage: 'Copied to clipboard',
  },
});

export const ClipboardButton = ({ text }) => {
  const { formatMessage } = useIntl();
  const [isCopy, setIsCopy] = useState(false);

  const copyToClipboardHandler = () => {
    setIsCopy(true);
    setTimeout(() => setIsCopy(false), 5000);
  };

  return (
    <div className={cx('copy-wrapper')}>
      {isCopy ? (
        <Tooltip content={formatMessage(messages.copyToClipboard)} placement="top">
          <div className={cx('popover-message')}>{Parser(IconTick)}</div>
        </Tooltip>
      ) : (
        <div onClick={copyToClipboardHandler} className={cx('clipboard')}>
          <CopyToClipboard className={cx('copy')} text={text}>
            {Parser(IconDuplicate)}
          </CopyToClipboard>
        </div>
      )}
    </div>
  );
};

ClipboardButton.propTypes = {
  text: PropTypes.string.isRequired,
};
