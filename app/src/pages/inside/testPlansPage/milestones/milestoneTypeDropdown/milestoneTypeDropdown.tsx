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

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { isBrowser, isString } from 'es-toolkit';
import { WrappedFieldProps } from 'redux-form';
import { Dropdown } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TmsMilestoneType } from 'controllers/milestone';

import { MilestoneTypeIcon } from '../milestonesTable/milestoneTypeIcon';
import { buildMilestoneTypeOptions } from '../milestoneModals/createMilestoneModal/milestoneTypeOptions';
import { createMilestoneModalMessages } from '../milestoneModals/createMilestoneModal/messages';
import type {
  MilestoneTypeDropdownOption,
  MilestoneTypeDropdownOptionRenderProps,
} from '../milestoneModals/createMilestoneModal/types';

import styles from '../milestoneModals/createMilestoneModal/createMilestoneModal.scss';

const cx = createClassnames(styles);

export const MilestoneTypeDropdown = (props: WrappedFieldProps & { label: string }) => {
  const { input, meta, label } = props;
  const { formatMessage } = useIntl();
  const value = (input.value ?? '') as TmsMilestoneType | '';

  const options = useMemo(() => buildMilestoneTypeOptions(formatMessage), [formatMessage]);

  const renderMilestoneTypeOption = useCallback(
    (optionProps: MilestoneTypeDropdownOptionRenderProps) => {
      const option = optionProps.option as MilestoneTypeDropdownOption;

      return (
        <div
          className={cx('create-milestone-modal__type-option', {
            'create-milestone-modal__type-option_selected': optionProps.selected,
            'create-milestone-modal__type-option_highlight': optionProps.highlightHovered,
          })}
        >
          <div className={cx('create-milestone-modal__type-option-icon')}>
            <MilestoneTypeIcon type={option.value} />
          </div>
          <div className={cx('create-milestone-modal__type-option-text')}>
            <div className={cx('create-milestone-modal__type-option-title')}>{option.label}</div>
            <div className={cx('create-milestone-modal__type-option-desc')}>
              {option.description}
            </div>
          </div>
        </div>
      );
    },
    [],
  );

  return (
    <Dropdown
      className={cx('milestone-type-dropdown')}
      label={
        <>
          {label}
          <span className={cx('create-milestone-modal__label-asterisk')} aria-hidden>
            *
          </span>
        </>
      }
      value={value}
      options={options}
      onChange={(v) => input.onChange(v)}
      renderOption={renderMilestoneTypeOption}
      placeholder={formatMessage(createMilestoneModalMessages.selectMilestoneTypePlaceholder)}
      error={isString(meta.error) ? meta.error : undefined}
      touched={meta.touched}
      icon={
        value ? (
          <span className={cx('create-milestone-modal__type-dropdown-toggle-icon')}>
            <MilestoneTypeIcon type={value} />
          </span>
        ) : undefined
      }
      menuPortalRoot={(isBrowser() && document.body) || undefined}
      notScrollable
      selectListClassName="milestone-type-dropdown-menu--compact"
    />
  );
};
