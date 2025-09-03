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

import { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './ownerBlock.scss';

const cx = classNames.bind(styles) as typeof classNames;

const messages = defineMessages({
  ownerTitle: {
    id: 'OwnerBlock.ownerTitle',
    defaultMessage: 'Owner',
  },
});

interface OwnerBlockProps {
  owner: string;
  disabled?: boolean;
  onClick?: (owner: string) => void;
}

export const OwnerBlock = ({ owner, disabled = false, onClick = () => {} }: OwnerBlockProps) => {
  const { formatMessage } = useIntl();
  const ownerRef = useRef<HTMLSpanElement>(null);
  const [ownerTitle, setOwnerTitle] = useState<string | undefined>(undefined);

  const clickHandler = () => {
    onClick(owner);
  };

  useEffect(() => {
    if (ownerRef.current) {
      const { offsetWidth, scrollWidth } = ownerRef.current;

      if (offsetWidth < scrollWidth) {
        setOwnerTitle(owner);
      } else {
        setOwnerTitle(undefined);
      }
    }
  }, [owner]);

  return (
    <div
      className={cx('owner-block', { disabled })}
      title={formatMessage(messages.ownerTitle)}
      onClick={clickHandler}
    >
      <div className={cx('owner-icon')} />
      <span ref={ownerRef} className={cx('owner')} title={ownerTitle}>
        {owner}
      </span>
    </div>
  );
};
