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

import { Button, Tooltip } from '@reportportal/ui-kit';

import { AddToLaunchPlace } from 'analyticsEvents/testCaseLibraryPageEvents';
import { ManualScenario } from 'types/testCase';
import type { AiLifecycle } from 'types/aiFactory';
import { createClassnames } from 'common/utils';

import { AddToLaunchAction, useAddToLaunchAction } from './useAddToLaunchAction';

import styles from './addToLaunchButton.scss';

const cx = createClassnames(styles);

export interface AddToLaunchButtonProps {
  testCaseId: number;
  manualScenario?: ManualScenario;
  lifecycle?: AiLifecycle;
  place: AddToLaunchPlace;
}

const renderAddToLaunchButton = ({
  label,
  isDisabled,
  disabledHint,
  onClick,
}: AddToLaunchAction) => {
  const buttonComponent = (
    <Button
      variant="ghost"
      onClick={onClick}
      data-automation-id="test-case-add-to-launch"
      disabled={isDisabled}
    >
      {label}
    </Button>
  );

  return isDisabled ? (
    <Tooltip
      placement="bottom"
      content={disabledHint}
      wrapperClassName={cx('tooltip-wrapper')}
      width={205}
    >
      {buttonComponent}
    </Tooltip>
  ) : (
    buttonComponent
  );
};

export const AddToLaunchButtonView = (props: AddToLaunchAction) => renderAddToLaunchButton(props);

export const AddToLaunchButton = (props: AddToLaunchButtonProps) => {
  const action = useAddToLaunchAction(props);

  return renderAddToLaunchButton(action);
};
