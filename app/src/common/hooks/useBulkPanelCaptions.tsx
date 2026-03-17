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

import { useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { BULK_COMMON_LOCALE_KEYS } from 'common/constants/localization';

export const useBulkPanelCaptions = () => {
  const { formatMessage } = useIntl();

  return useMemo(
    () => ({
      selected: formatMessage(BULK_COMMON_LOCALE_KEYS.SELECTED),
      clearSelection: formatMessage(BULK_COMMON_LOCALE_KEYS.CLEAR_SELECTION),
      selectedItems: formatMessage(BULK_COMMON_LOCALE_KEYS.SELECTED_ITEMS),
      eligibleTab: formatMessage(BULK_COMMON_LOCALE_KEYS.ELIGIBLE_TAB),
      ineligibleTab: formatMessage(BULK_COMMON_LOCALE_KEYS.INELIGIBLE_TAB),
      ineligibleInfoMessage: (count: number) =>
        formatMessage(BULK_COMMON_LOCALE_KEYS.INELIGIBLE_INFO_MESSAGE, {
          count,
          b: (chunks: ReactNode) => <b>{chunks}</b>,
        }),
      cancelButton: (actionLabel: string) =>
        formatMessage(BULK_COMMON_LOCALE_KEYS.CANCEL_BUTTON, { actionLabel }),
      proceedButton: (count: number) =>
        formatMessage(BULK_COMMON_LOCALE_KEYS.PROCEED_BUTTON, { count }),
    }),
    [formatMessage],
  );
};
