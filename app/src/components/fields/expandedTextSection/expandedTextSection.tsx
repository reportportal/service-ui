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

import { useState, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { messages } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList/messages';

import styles from './expandedTextSection.scss';

const cx = createClassnames(styles);

const OFFSET_COEFFICIENT = 1.4;

interface ExpandedTextSectionProps {
  text: string;
  defaultVisibleLines?: number;
  fontSize?: number;
}

export const ExpandedTextSection = ({
  text,
  defaultVisibleLines = 3,
  fontSize = 13,
}: ExpandedTextSectionProps) => {
  const { formatMessage } = useIntl();
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = fontSize * OFFSET_COEFFICIENT;
      const maxHeight = lineHeight * defaultVisibleLines;
      const actualHeight = textRef.current.scrollHeight;

      setShouldTruncate(actualHeight > maxHeight);
    }
  }, [text, defaultVisibleLines, fontSize]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cx('expanded-text-section')}>
      <div
        ref={textRef}
        className={cx('text-content', { truncated: shouldTruncate && !isExpanded })}
        style={
          {
            fontSize: `${fontSize}px`,
            '--visible-lines': defaultVisibleLines,
            '--line-height': `${fontSize * OFFSET_COEFFICIENT}px`,
          } as React.CSSProperties
        }
      >
        {text}
      </div>
      {shouldTruncate && (
        <button type="button" className={cx('toggle-button')} onClick={handleToggle}>
          {isExpanded ? formatMessage(messages.hideAll) : formatMessage(messages.showAll)}
        </button>
      )}
    </div>
  );
};
