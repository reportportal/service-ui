/*
 * Copyright 2019 EPAM Systems
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
  includedToAa: {
    id: 'MakeDecisionModal.includedToAa',
    defaultMessage: 'Included to Auto-Analysis',
  },
  excludedFromAa: {
    id: 'MakeDecisionModal.excludedFromAa',
    defaultMessage: 'Excluded from Auto-Analysis',
  },
  defectCommentPlaceholder: {
    id: 'MakeDecisionModal.defectCommentPlaceholder',
    defaultMessage: 'Defect comment',
  },
  defectCommentBulkOperationPlaceholder: {
    id: 'MakeDecisionModal.defectCommentBulkOperationPlaceholder',
    defaultMessage: 'Add new data to existing comments',
  },
  clearCommentsAndApply: {
    id: 'MakeDecisionModal.clearCommentsAndApply',
    defaultMessage: 'Clear Comments and Apply',
  },
  replaceCommentsAndApply: {
    id: 'MakeDecisionModal.replaceCommentsAndApply',
    defaultMessage: 'Replace Comments and Apply',
  },
  ignoreAa: {
    id: 'MakeDecisionModal.ignoreAa',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  ignoreAaShort: {
    id: 'MakeDecisionModal.ignoreAaShort',
    defaultMessage: 'Ignore in AA',
  },
  decisionForTest: {
    id: 'MakeDecisionModal.decisionForTest',
    defaultMessage: 'Decision for the test {launchNumber}',
  },
  test: {
    id: 'MakeDecisionModal.test',
    defaultMessage: 'Test {launchNumber}',
  },
  currentSelection: {
    id: 'MakeDecisionModal.currentSelection',
    defaultMessage: 'Current selection',
  },
  bulk: { id: 'MakeDecisionModal.bulk', defaultMessage: 'Bulk' },
  bulkOperationDecision: {
    id: 'MakeDecisionModal.bulkOperationDecision',
    defaultMessage: 'Bulk Operation Decision',
  },
  applyToItems: {
    id: 'MakeDecisionModal.applyToItems',
    defaultMessage: 'Apply to {itemsCount} Items',
  },
  selectDefectTypeManually: {
    id: 'MakeDecisionModal.selectDefectTypeManually',
    defaultMessage: 'Select defect type manually',
  },
  machineLearningSuggestions: {
    id: 'MakeDecisionModal.machineLearningSuggestions',
    defaultMessage: 'Choose among ML suggestions',
  },
  copyFromHistoryLine: {
    id: 'MakeDecisionModal.copyFromHistoryLine',
    defaultMessage: 'Copy from history line',
  },
  apply: {
    id: 'MakeDecisionModal.apply',
    defaultMessage: 'Apply',
  },
  applyAndContinue: {
    id: 'MakeDecisionModal.applyAndContinue',
    defaultMessage: 'Apply & Continue',
  },
  modalNote: {
    id: 'MakeDecisionModal.modalNote',
    defaultMessage: 'You have to save changes or cancel them before closing the window',
  },
  disabledTabTooltip: {
    id: 'MakeDecisionModal.disabledTabTooltip',
    defaultMessage: 'A new functionality will be available in the next version',
  },
  postIssueNote: {
    id: 'MakeDecisionModal.postIssueNote',
    defaultMessage:
      'After a defect type submission, you will be able to choose parameters for a new issue posting',
  },
  linkIssueNote: {
    id: 'MakeDecisionModal.linkIssueNote',
    defaultMessage:
      'After a defect type submission, you will be able to choose parameters for a new issue linking',
  },
  unlinkIssueNote: {
    id: 'MakeDecisionModal.unlinkIssueNote',
    defaultMessage: 'After a defect type submission, the current links will be unlinked',
  },
  execution: {
    id: 'MakeDecisionModal.execution',
    defaultMessage: 'Execution',
  },
  defectType: {
    id: 'MakeDecisionModal.defectType',
    defaultMessage: 'Defect type',
  },
  applyDefectFor: {
    id: 'MakeDecisionModal.applyDefectFor',
    defaultMessage: 'Apply defect for:',
  },
  applyToSimilarItems: {
    id: 'MakeDecisionModal.applyToSimilarItems',
    defaultMessage: 'You can also apply this changes to other similar items in',
  },
  currentExecutionOnly: {
    id: 'MakeDecisionModal.currentExecutionOnly',
    defaultMessage: 'Current execution only',
  },
  currentLaunch: {
    id: 'MakeDecisionModal.currentLaunch',
    defaultMessage: 'Similar errors in the current launch',
  },
  currentLaunchTooltip: {
    id: 'MakeDecisionModal.currentLaunchTooltip',
    defaultMessage:
      'Tests with To Investigate defect type with error logs matching selected item on 98% and more',
  },
  lastTenLaunches: {
    id: 'MakeDecisionModal.lastTenLaunches',
    defaultMessage: 'Similar errors in last 10 launches',
  },
  lastTenLaunchesTooltip: {
    id: 'MakeDecisionModal.lastTenLaunchesTooltip',
    defaultMessage:
      'Tests with To Investigate defect type from last 10 launches with error logs matching selected item on 98% and more',
  },
  withFilter: {
    id: 'MakeDecisionModal.withFilter',
    defaultMessage: 'Similar errors in {filterName}',
  },
  withFilterTooltip: {
    id: 'MakeDecisionModal.withFilterTooltip',
    defaultMessage:
      'Tests with To Investigate defect type from last 10 launches of the filter {filterName} with error logs matching selected item on 98% and more',
  },
  showErrorLogs: {
    id: 'MakeDecisionModal.showErrorLogs',
    defaultMessage: 'Show Error Logs',
  },
  selectedItemCount: {
    id: 'MakeDecisionModal.selectedItemCount',
    defaultMessage: '{selected}/{total} items selected',
  },
  allLoadedTIFromHistoryLine: {
    id: 'MakeDecisionModal.allLoadedTIFromHistoryLine',
    defaultMessage: 'All loaded TI from the history line',
  },
  analyzerUnavailable: {
    id: 'MakeDecisionModal.analyzerUnavailable',
    defaultMessage: 'Service Analyzer is not running',
  },
  updateDefectsSuccess: {
    id: 'MakeDecisionModal.updateDefectsSuccess',
    defaultMessage: 'Defects have been updated',
  },
  updateDefectsFailed: {
    id: 'MakeDecisionModal.updateDefectsFailed',
    defaultMessage: 'Failed to update defects',
  },
  similarity: {
    id: 'MakeDecisionModal.similarity',
    defaultMessage: 'Similarity',
  },
  suggestedTest: {
    id: 'MakeDecisionModal.suggestedTest',
    defaultMessage: 'Suggested test as a source',
  },
});
