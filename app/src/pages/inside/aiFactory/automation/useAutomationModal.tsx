/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useModal } from 'common/hooks/useModal';

import { AUTOMATION_MODAL_KEY, AutomationModal, type AutomationModalData } from './automationModal';

export const useAutomationModal = () =>
  useModal<AutomationModalData>({
    modalKey: AUTOMATION_MODAL_KEY,
    renderModal: (data) => <AutomationModal data={data} />,
  });
