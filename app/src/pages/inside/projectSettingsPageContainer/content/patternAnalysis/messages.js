/*
 * Copyright 2022 EPAM Systems
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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  noPatternAnalysisTitle: {
    id: 'NoPatternAnalysis.title',
    defaultMessage: 'No Pattern Rules',
  },
  noPatternAnalysisDescription: {
    id: 'NoPatternAnalysis.description',
    defaultMessage:
      'System can analyze test results automatically by comparing test result stack trace with patterns saved in the system',
  },
  createPatternModalHeader: {
    id: 'CreatePatternAnalysisModal.createPatternModalHeader',
    defaultMessage: 'Create Pattern',
  },
  createPatternModalDescription: {
    id: 'CreatePatternAnalysisModal.createPatternModalDescription',
    defaultMessage: 'Create a Pattern specifying a condition for common failure reason',
  },
  createPatternModalToggle: {
    id: 'CreatePatternAnalysisModal.createPatternModalToggle',
    defaultMessage: 'Active Rule',
  },
  createPatternModalPatternName: {
    id: 'CreatePatternAnalysisModal.createPatternModalPatternName',
    defaultMessage: 'Pattern Name',
  },
  createPatternModalType: {
    id: 'CreatePatternAnalysisModal.createPatternModalType',
    defaultMessage: 'Type',
  },
  createPatternModalCondition: {
    id: 'CreatePatternAnalysisModal.createPatternModalCondition',
    defaultMessage: 'Pattern Condition',
  },
  patternConditionPlaceholder: {
    id: 'CreatePatternAnalysisModal.patternConditionPlaceholder',
    defaultMessage: 'Text description',
  },
  tabDescription: {
    id: 'PatternAnalysis.tabDescription',
    defaultMessage:
      'The Pattern-Analysis feature helps to find common patterns in error logs by marking them with the "PA" label',
  },
  autoPatternAnalysis: {
    id: 'PatternAnalysis.autoPatternAnalysis',
    defaultMessage: 'Auto Pattern-Analysis',
  },
  autoPatternAnalysisDescription: {
    id: 'PatternAnalysis.autoPatternAnalysisDescription',
    defaultMessage: 'Analysis starts as soon as any launch is finished',
  },
  create: {
    id: 'PatternAnalysis.createPattern',
    defaultMessage: 'Create Pattern',
  },
  duplicate: {
    id: 'PatternAnalysis.duplicatePattern',
    defaultMessage: 'Duplicate Pattern',
  },
  deletePattern: {
    id: 'PatternAnalysis.deletePattern',
    defaultMessage: 'Delete Pattern',
  },
  deletePatternMsg: {
    id: 'PatternAnalysis.deletePatternMsg',
    defaultMessage: 'Are you sure you want to delete this pattern?',
  },
});
