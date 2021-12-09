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
  defectIncludeInAa: {
    id: 'MakeDecisionModal.defectIncludeInAa',
    defaultMessage: 'defect will be included in Auto-Analysis',
  },
  defectIgnoreInAa: {
    id: 'MakeDecisionModal.defectIgnoreInAa',
    defaultMessage: 'defect will be ignored in Auto-Analysis',
  },
  and: {
    id: 'MakeDecisionModal.and',
    defaultMessage: 'and',
  },
  comment: {
    id: 'MakeDecisionModal.comment',
    defaultMessage: 'Comment',
  },
  ignoreAa: {
    id: 'MakeDecisionModal.ignoreAa',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  ignoreAaShort: {
    id: 'MakeDecisionModal.ignoreAaShort',
    defaultMessage: 'Ignore in AA',
  },
  executionToChange: {
    id: 'MakeDecisionModal.executionToChange',
    defaultMessage: 'Execution to change',
  },
  applyToItem: {
    id: 'MakeDecisionModal.applyToItem',
    defaultMessage: 'Results will be applied for the Item',
  },
  applyToItems: {
    id: 'MakeDecisionModal.applyToItems',
    defaultMessage: 'Results will be applied for {itemsCount} Items',
  },
  selectDefect: {
    id: 'MakeDecisionModal.selectDefect',
    defaultMessage: 'Select defect',
  },
  selectDefectTypeManually: {
    id: 'MakeDecisionModal.selectDefectTypeManually',
    defaultMessage: 'Select defect manually',
  },
  copyFromHistoryLine: {
    id: 'MakeDecisionModal.copyFromHistoryLine',
    defaultMessage: 'Analyzed executions from the test history',
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
  applyFor: {
    id: 'MakeDecisionModal.applyFor',
    defaultMessage: 'Apply for:',
  },
  currentExecutionOnly: {
    id: 'MakeDecisionModal.currentExecutionOnly',
    defaultMessage: 'Current item only',
  },
  currentLaunch: {
    id: 'MakeDecisionModal.currentLaunch',
    defaultMessage: 'Similar ”To Investigate” in the launch & current item',
  },
  currentLaunchTooltip: {
    id: 'MakeDecisionModal.currentLaunchTooltip',
    defaultMessage:
      'Tests with To Investigate defect type with error logs matching selected item on 98% and more',
  },
  launchName: {
    id: 'MakeDecisionModal.launchName',
    defaultMessage: 'Similar “To Investigate” in 10 launches & current item',
  },
  lastTenLaunchesTooltip: {
    id: 'MakeDecisionModal.lastTenLaunchesTooltip',
    defaultMessage:
      'Tests with To Investigate defect type from last 10 launches with error logs matching selected item on 98% and more',
  },
  filter: {
    id: 'MakeDecisionModal.filter',
    defaultMessage: 'Similar “To Investigate” in the {filterName} & current item',
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
    defaultMessage: '“To Investigate” from the history line & current item',
  },
  analyzerUnavailable: {
    id: 'MakeDecisionModal.analyzerUnavailable',
    defaultMessage: 'Service Analyzer is not running,',
  },
  pleaseCheck: {
    id: 'MakeDecisionModal.pleaseCheck',
    defaultMessage: 'please check',
  },
  analyzerUnavailableLink: {
    id: 'MakeDecisionModal.analyzerUnavailableLink',
    defaultMessage: 'how it could be fixed',
  },
  updateDefectsSuccess: {
    id: 'MakeDecisionModal.updateDefectsSuccess',
    defaultMessage: 'Defects have been updated',
  },
  updateDefectsFailed: {
    id: 'MakeDecisionModal.updateDefectsFailed',
    defaultMessage: 'Failed to update defects',
  },
  suggestedChoiceSuccess: {
    id: 'MakeDecisionModal.suggestedChoiceSuccess',
    defaultMessage: 'User choice of suggested item was sent for handling to ML',
  },
  suggestedChoiceFailed: {
    id: 'MakeDecisionModal.suggestedChoiceFailed',
    defaultMessage: 'The proposed item selected by the user has not been sent for processing to ML',
  },
  similarLog: {
    id: 'MakeDecisionModal.similarLog',
    defaultMessage: 'Similar Log',
  },
  noLogs: {
    id: 'MakeDecisionModal.noLogs',
    defaultMessage: 'No Logs Found x_x',
  },
  noItems: {
    id: 'MakeDecisionModal.noItems',
    defaultMessage: 'No Items',
  },
  analyzingSuggestions: {
    id: 'MakeDecisionModal.analyzingSuggestions',
    defaultMessage: 'Analyzing Suggestions',
  },
  analyzerSuggestion: {
    id: 'MakeDecisionModal.analyzerSuggestion',
    defaultMessage: 'Analyzer Suggestion',
  },
  noSuggestions: {
    id: 'MakeDecisionModal.noSuggestions',
    defaultMessage: 'No Analyzer Suggestions',
  },
  selection: {
    id: 'MakeDecisionModal.selection',
    defaultMessage: 'Selection',
  },
  manual: {
    id: 'MakeDecisionModal.manual',
    defaultMessage: 'Manual',
  },
  history: {
    id: 'MakeDecisionModal.history',
    defaultMessage: 'History',
  },
  ofTheTest: {
    id: 'MakeDecisionModal.ofTheTest',
    defaultMessage: 'of the test',
  },
  executionWith: {
    id: 'MakeDecisionModal.executionWith',
    defaultMessage: 'The execution with {value}% similarity of defect',
  },
  commentReplaceWith: {
    id: 'MakeDecisionModal.commentReplaceWith',
    defaultMessage: 'Comment will be replaced with:',
  },
  commentWillRemoved: {
    id: 'MakeDecisionModal.commentWillRemoved',
    defaultMessage: 'Comment will be removed',
  },
  commentWill: {
    id: 'MakeDecisionModal.commentWill',
    defaultMessage: 'Comments will',
  },
  notChangedForAll: {
    id: 'MakeDecisionModal.notChangedForAll',
    defaultMessage: 'not be changed for all chosen items',
  },
  clearForAll: {
    id: 'MakeDecisionModal.clearForAll',
    defaultMessage: 'be cleared for all chosen items',
  },
  addForAll: {
    id: 'MakeDecisionModal.addForAll',
    defaultMessage: 'be added for all chosen items',
  },
  replaceForAll: {
    id: 'MakeDecisionModal.replaceForAll',
    defaultMessage: 'be replaced for all chosen items with',
  },
  followingResult: {
    id: 'MakeDecisionModal.followingResult',
    defaultMessage: 'Following results will be applied for {items}',
  },
  itemsCount: {
    id: 'MakeDecisionModal.itemsCount',
    defaultMessage: '{count} Items',
  },
  item: {
    id: 'MakeDecisionModal.item',
    defaultMessage: 'the Item',
  },
  linkAddedOnNextStep: {
    id: 'MakeDecisionModal.linkAddedOnNextStep',
    defaultMessage: 'The link to Bug Tracking System will be added in the next step',
  },
  linkRemovedOnNextStep: {
    id: 'MakeDecisionModal.linkRemovedOnNextStep',
    defaultMessage: 'The link to Bug Tracking System will be removed in the next step',
  },
  linkReplacedWith: {
    id: 'MakeDecisionModal.linkReplacedWith',
    defaultMessage: 'The link to Bug Tracking System will be replaced with',
  },
  defectReplaceWith: {
    id: 'MakeDecisionModal.defectReplaceWith',
    defaultMessage: 'The defect type will be changed to',
  },
});
