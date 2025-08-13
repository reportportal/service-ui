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

import { MessageDescriptor, useIntl } from 'react-intl';
import { Button, PlusIcon, Tooltip } from '@reportportal/ui-kit';

interface AddItemButtonProps {
  onClick: () => void;
  tooltipContent: MessageDescriptor;
  text: string;
  tooltipClassname?: string;
  disabled?: boolean;
}

export const AddItemButton = ({
  onClick,
  tooltipContent,
  text,
  tooltipClassname = '',
  disabled = false,
}: AddItemButtonProps) => {
  const { formatMessage } = useIntl();

  const renderButton = () => (
    <Button
      variant="text"
      adjustWidthOn="content"
      icon={<PlusIcon />}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </Button>
  );

  return disabled ? (
    <Tooltip
      wrapperClassName={tooltipClassname}
      placement="top"
      content={formatMessage(tooltipContent)}
    >
      {renderButton()}
    </Tooltip>
  ) : (
    renderButton()
  );
};
