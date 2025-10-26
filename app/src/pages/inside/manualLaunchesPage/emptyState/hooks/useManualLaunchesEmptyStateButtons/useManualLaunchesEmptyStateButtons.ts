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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import { activeProjectSelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { messages } from 'pages/inside/manualLaunchesPage/messages';

import { EMPTY_STATE_BUTTONS } from './constants';
import { ButtonVariant } from '../../../../../../types/common';
import { ActiveProject } from './types';

export const useManualLaunchesEmptyStateButtons = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(activeProjectSelector) as ActiveProject;
  const { canCreateManualLaunch } = useUserPermissions();

  return useMemo(() => {
    const payload = { organizationSlug, projectSlug };

    if (!canCreateManualLaunch) {
      return [];
    }

    return EMPTY_STATE_BUTTONS.map(({ name, type }) => ({
      name: formatMessage(messages[name]),
      variant: ButtonVariant.text,
      handleButton: () => dispatch({ type, payload }),
    }));
  }, [organizationSlug, projectSlug, dispatch, canCreateManualLaunch, formatMessage]);
};
