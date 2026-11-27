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

import { useLayoutEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';

import { messages } from './messages';

import styles from './expandedTextSection.scss';

const cx = createClassnames(styles);

interface ExpandedTextSectionProps {
  text: string;
  defaultVisibleLines?: number;
  isCompact?: boolean;
}

export const ExpandedTextSection = ({
  text,
  defaultVisibleLines = 3,
  isCompact = false,
}: ExpandedTextSectionProps) => {
  const { formatMessage } = useIntl();
  const [expandedText, setExpandedText] = useState<string | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const isExpanded = expandedText === text;

  useLayoutEffect(() => {
    const element = textRef.current;

    if (!element || isExpanded) {
      return undefined;
    }

    const measureOverflow = () => setIsOverflowing(element.scrollHeight > element.clientHeight);

    measureOverflow();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(measureOverflow);

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [text, defaultVisibleLines, isExpanded]);

  const handleToggle = () => {
    setExpandedText(isExpanded ? null : text);
  };

  return (
    <div className={cx('expanded-text-section', { compact: isCompact })}>
      <div
        ref={textRef}
        className={cx('text-content', { truncated: !isExpanded })}
        style={{ '--visible-lines': defaultVisibleLines } as React.CSSProperties}
      >
        {text}
      </div>
      {(isOverflowing || isExpanded) && (
        <button type="button" className={cx('toggle-button')} onClick={handleToggle}>
          {formatMessage(isExpanded ? messages.showLess : messages.showMore)}
        </button>
      )}
    </div>
  );
};
