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

import Parser from 'html-react-parser';

import { createClassnames } from 'common/utils';
import CrossIcon from 'common/img/cross-icon-inline.svg';

import styles from './launchAttribute.scss';
import { isEmpty } from 'es-toolkit/compat';

const cx = createClassnames(styles);

interface LaunchAttributeProps {
  attributeKey: string;
  value: string;
  onRemove?: () => void;
}

export const LaunchAttribute = ({ attributeKey, value, onRemove }: LaunchAttributeProps) => {
  const isHasValue = !isEmpty(attributeKey) || !isEmpty(value);

  if (!isHasValue) {
    return null;
  }

  return (
    <div className={cx('launch-attribute')}>
      <div className={cx('attribute-content')}>
        {attributeKey && <span className={cx('attribute-key')}>{attributeKey}:</span>}
        {value && <span className={cx('attribute-value')}>{value}</span>}
      </div>
      {onRemove && (
        <button
          type="button"
          className={cx('remove-button')}
          onClick={onRemove}
          data-automation-id="remove-launch-attribute"
        >
          {Parser(CrossIcon as unknown as string)}
        </button>
      )}
    </div>
  );
};
