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

import { useIntl } from 'react-intl';
import { Button, Tooltip } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { useAddToLaunchModal } from '../addToLaunchModal/useAddToLaunchModal';

import styles from './addToLaunchButton.scss';

const cx = createClassnames(styles);

interface AddToLaunchButtonProps {
  isButtonDisabled: boolean;
  testCaseName: string;
}

export const AddToLaunchButton = ({ isButtonDisabled, testCaseName }: AddToLaunchButtonProps) => {
  const { formatMessage } = useIntl();
  const { openModal: openAddToLaunchModal } = useAddToLaunchModal();

  const handleAddToLaunchClick = () => {
    openAddToLaunchModal({ testCaseName });
  };

  const buttonComponent = (
    <Button
      variant="ghost"
      onClick={handleAddToLaunchClick}
      data-automation-id="test-case-add-to-launch"
      disabled={isButtonDisabled}
    >
      {formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH)}
    </Button>
  );

  return isButtonDisabled ? (
    <Tooltip
      placement="bottom"
      content={formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH_TOOLTIP_TEXT)}
      wrapperClassName={cx('tooltip-wrapper')}
      width={205}
    >
      {buttonComponent}
    </Tooltip>
  ) : (
    buttonComponent
  );
};
