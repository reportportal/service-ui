/*
 * Copyright 2026 EPAM Systems
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

import { ReactNode, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Button, CloseIcon, Dropdown, FieldLabel } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { ConditionOption } from '../types';
import styles from './fieldRow.scss';

const cx = createClassnames(styles);

const menuPortalRoot =
  typeof document === 'undefined' ? undefined : document.getElementById('tooltip-root') || document.body;

interface FieldRowProps {
  title: string;
  condition?: string;
  /** Operator choices, e.g. Contains/Equals. Omit for entities whose condition is fixed
   * under the hood (Execution type, Owner, Start time) — the title is shown as a plain
   * label instead of an operator dropdown. */
  conditionOptions?: ConditionOption[];
  onConditionChange?: (condition: string) => void;
  removable?: boolean;
  isRequired?: boolean;
  disabled?: boolean;
  shouldFocus?: boolean;
  onRemove: () => void;
  onAutoFocus?: () => void;
  children: ReactNode;
}

export const FieldRow = ({
  title,
  condition = '',
  conditionOptions = [],
  onConditionChange,
  removable = false,
  isRequired = false,
  disabled = false,
  shouldFocus = false,
  onRemove,
  onAutoFocus,
  children,
}: FieldRowProps) => {
  const { formatMessage } = useIntl();
  const valueRef = useRef<HTMLDivElement>(null);
  const hasOperator = conditionOptions.length > 0;

  useEffect(() => {
    if (!shouldFocus) {
      return;
    }

    const focusTarget = valueRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, button, [role="button"][tabindex]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusTarget) {
      focusTarget.focus();
      // ui-kit Dropdown is div[role=button]; styles are :focus-visible/.opened — click to open
      if (focusTarget.getAttribute('role') === 'button') {
        focusTarget.click();
      }
    }

    onAutoFocus?.();
  }, [shouldFocus, onAutoFocus]);

  return (
    <div className={cx('field-row-wrapper')}>
      <FieldLabel isRequired={isRequired}>{title}</FieldLabel>
      <div className={cx('field-row')}>
        {hasOperator && (
          <div className={cx('operator')}>
            <Dropdown
              options={conditionOptions}
              value={condition}
              disabled={disabled}
              onChange={(nextValue) => onConditionChange?.(String(nextValue))}
              menuPortalRoot={menuPortalRoot}
            />
          </div>
        )}
        <div className={cx('value')} ref={valueRef}>
          {children}
        </div>
        {removable && (
          <Button
            className={cx('remove')}
            adjustWidthOn="content"
            variant="ghost"
            onClick={onRemove}
            disabled={disabled}
            aria-label={formatMessage(COMMON_LOCALE_KEYS.REMOVE)}
          >
            <CloseIcon />
          </Button>
        )}
      </div>
    </div>
  );
};
