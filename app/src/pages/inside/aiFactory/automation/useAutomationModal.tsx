/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useCallback } from 'react';

import { useModal } from 'common/hooks/useModal';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { AUTOMATION_MODAL_KEY, AutomationModal, type AutomationModalData } from './automationModal';

export const useAutomationModal = () => {
  const { canAutomateTestCases } = useUserPermissions();
  const { openModal: openRawModal } = useModal<AutomationModalData>({
    modalKey: AUTOMATION_MODAL_KEY,
    renderModal: (data) => <AutomationModal data={data} />,
  });

  const openModal = useCallback(
    (data?: AutomationModalData) => {
      if (canAutomateTestCases) {
        openRawModal(data);
      }
    },
    [canAutomateTestCases, openRawModal],
  );

  return { openModal };
};
