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

import { useLayoutEffect, useState } from 'react';
import Parser from 'html-react-parser';
import { isEmpty } from 'es-toolkit/compat';

import { Tooltip } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import CrossIcon from 'common/img/cross-icon-inline.svg';

import styles from './launchAttribute.scss';

const cx = createClassnames(styles);

const TOOLTIP_WIDTH = 200;

interface LaunchAttributeProps {
  attributeKey: string;
  value: string;
  onRemove?: () => void;
}

export const LaunchAttribute = ({ attributeKey, value, onRemove }: LaunchAttributeProps) => {
  const hasValue = !isEmpty(attributeKey) || !isEmpty(value);
  // State-based (callback) refs so the measurement is re-attached when the chip
  // is re-mounted inside / outside of the Tooltip.
  const [keyElement, setKeyElement] = useState<HTMLSpanElement | null>(null);
  const [valueElement, setValueElement] = useState<HTMLSpanElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const elements = [keyElement, valueElement].filter(Boolean) as HTMLElement[];

    const check = () =>
      setIsTruncated(elements.some((element) => element.scrollWidth > element.clientWidth));

    check();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(check);

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [keyElement, valueElement, attributeKey, value]);

  if (!hasValue) {
    return null;
  }

  const fullText = [attributeKey, value].filter(Boolean).join(': ');

  const chip = (
    <div className={cx('launch-attribute')}>
      <div className={cx('attribute-content')}>
        {attributeKey && (
          <span ref={setKeyElement} className={cx('attribute-key')}>
            {attributeKey}:
          </span>
        )}
        {value && (
          <span ref={setValueElement} className={cx('attribute-value')}>
            {value}
          </span>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          className={cx('remove-button')}
          onClick={onRemove}
          data-automation-id="remove-launch-attribute"
        >
          {Parser(CrossIcon)}
        </button>
      )}
    </div>
  );

  if (!isTruncated) {
    return chip;
  }

  return (
    <Tooltip
      content={fullText}
      placement="top"
      width={TOOLTIP_WIDTH}
      wrapperClassName={cx('tooltip-wrapper')}
      contentClassName={cx('tooltip-content')}
    >
      {chip}
    </Tooltip>
  );
};
