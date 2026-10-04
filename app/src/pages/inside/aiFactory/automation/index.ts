/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

export { AutomationSection } from './automationSection';
export { useAutomationModal } from './useAutomationModal';
export {
  getAutomationCandidateLabel,
  getAutomationSkipReason,
  normalizeAutomateAccepted,
  normalizeAutomationEnvironments,
  partitionAutomationSelection,
  type AutomationCandidate,
  type AutomationSelection,
  type SkippedAutomationCandidate,
} from './automationUtils';
export { messages as automationMessages } from './messages';
export { automationDisabledMessages, automationSkipReasonMessages } from './messages';
