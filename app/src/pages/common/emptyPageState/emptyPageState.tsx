/*!
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

import { ReactNode } from 'react';
import { Button, Tooltip } from '@reportportal/ui-kit';
import Parser from 'html-react-parser';

import { createClassnames } from 'common/utils';

import styles from './emptyPageState.scss';

const cx = createClassnames(styles);

interface EmptyPageStateProps {
  emptyIcon: string;
  hasPermission?: boolean;
  label?: string;
  description?: string;
  buttonTitle?: string;
  icon?: ReactNode;
  onClick?: () => void;
  tooltipContent?: string;
  isButtonDisabled?: boolean;
}

export const EmptyPageState = ({
  hasPermission = false,
  label = '',
  description = '',
  icon = null,
  buttonTitle = '',
  emptyIcon,
  onClick,
  tooltipContent = '',
  isButtonDisabled = false,
}: EmptyPageStateProps) => {
  const renderButton = () => (
    <Button
      variant={'primary'}
      className={cx('button')}
      icon={icon}
      onClick={onClick}
      disabled={isButtonDisabled}
    >
      {buttonTitle}
    </Button>
  );

  return (
    <div className={cx('empty-page-state')}>
      <div className={cx('empty-icon')}>{Parser(emptyIcon)}</div>
      <div className={cx('content')}>
        <span className={cx('label')}>{label}</span>
        <p className={cx('description')}>{description}</p>
        {hasPermission &&
          (tooltipContent && isButtonDisabled ? (
            <Tooltip
              content={tooltipContent}
              tooltipClassName={cx('tooltip')}
              wrapperClassName={cx('tooltip-wrapper')}
              placement="bottom"
            >
              {renderButton()}
            </Tooltip>
          ) : (
            renderButton()
          ))}
      </div>
    </div>
  );
};
