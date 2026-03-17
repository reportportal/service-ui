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
import { useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import { BulkPanelAction, BulkPanelItem } from '@reportportal/ui-kit/bulkPanel';
import { showModalAction, hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showDefaultErrorNotification } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { DeleteUsersModal } from '../allUsersListTable/modals/deleteUsersModal';
import { ApiError } from 'types/api';

const messages = defineMessages({
  deleteSuccess: {
    id: 'AllUsersPage.bulkDelete.success',
    defaultMessage:
      'Selected {count, plural, one {user has} other {users have}} been deleted successfully',
  },
});

interface UseDeleteUsersActionProps {
  onSuccess: () => void;
}

export const useDeleteUsersAction = ({ onSuccess }: UseDeleteUsersActionProps): BulkPanelAction => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const deleteUsers = useCallback(
    (items: BulkPanelItem[]) => {
      const ids = items.map((item) => item.id).join(',');

      fetch(URLS.deleteUsers(ids), { method: 'delete' })
        .then(() => {
          dispatch(hideModalAction());
          dispatch(
            showSuccessNotification({
              message: formatMessage(messages.deleteSuccess, { count: items.length }),
            }),
          );
          onSuccess();
        })
        .catch((error: ApiError) => {
          dispatch(showDefaultErrorNotification(error));
        });
    },
    [dispatch, formatMessage, onSuccess],
  );

  const handleProceed = useCallback(
    (eligibleItems: BulkPanelItem[]) => {
      const onConfirm = () => {
        trackEvent(ALL_USERS_PAGE_EVENTS.bulkDeleteUsersModal(eligibleItems.length));
        deleteUsers(eligibleItems);
      };

      trackEvent(ALL_USERS_PAGE_EVENTS.BULK_DELETE_USERS);
      dispatch(
        showModalAction({
          component: <DeleteUsersModal count={eligibleItems.length} onConfirm={onConfirm} />,
        }),
      );
    },
    [dispatch, deleteUsers, trackEvent],
  );

  return useMemo(
    () => ({
      label: formatMessage(COMMON_LOCALE_KEYS.DELETE),
      variant: 'danger',
      onProceed: handleProceed,
    }),
    [formatMessage, handleProceed],
  );
};
