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
  ignoreAaTitle: {
    id: 'EditDefectModal.ignoreAaTitle',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  title: {
    id: 'EditDefectModal.title',
    defaultMessage: 'Edit defect type',
  },
  notChangeCommentTitle: {
    id: 'EditDefectModal.notChangeCommentTitle',
    defaultMessage: "Don't change comment of selected items",
  },
  replaceCommentsTitle: {
    id: 'EditDefectModal.replaceCommentsTitleShort',
    defaultMessage: 'Replace comments to all selected items',
  },
  addToExistingCommentTitle: {
    id: 'EditDefectModal.addToExistingCommentTitle',
    defaultMessage: 'Add new data to existing comments',
  },
  hotKeyCancelCaption: {
    id: 'EditDefectModal.hotKeyCancelCaption',
    defaultMessage: 'to cancel',
  },
  hotKeySubmitCaption: {
    id: 'EditDefectModal.hotKeySubmitCaption',
    defaultMessage: 'to submit',
  },
  defectTypeTitle: {
    id: 'EditDefectModal.defectTypeTitle',
    defaultMessage: 'Defect type',
  },
  saveAndPostIssueMessage: {
    id: 'EditDefectModal.saveAndPostIssueMessage',
    defaultMessage: 'Save and post issue',
  },
  saveAndLinkIssueMessage: {
    id: 'EditDefectModal.saveAndLinkIssueMessage',
    defaultMessage: 'Save and link issue',
  },
  saveAndUnlinkIssueMessage: {
    id: 'EditDefectModal.saveAndUnlinkIssueMessage',
    defaultMessage: 'Save and unlink issue',
  },
  updateDefectsSuccess: {
    id: 'EditDefectModal.updateDefectsSuccess',
    defaultMessage: 'Defects have been updated',
  },
  updateDefectsFailed: {
    id: 'EditDefectModal.updateDefectsFailed',
    defaultMessage: 'Failed to update defects',
  },
  defectTypeSelectorPlaceholder: {
    id: 'EditDefectModal.defectTypeSelectorPlaceholder',
    defaultMessage: 'Choose defect type',
  },
  defectCommentPlaceholder: {
    id: 'EditDefectModal.defectCommentPlaceholder',
    defaultMessage: 'Leave comment to defect type',
  },
  selectedCount: {
    id: 'EditDefectModal.selectedCount',
    defaultMessage: '{count}/{total} selected items',
  },
  totalCount: {
    id: 'EditDefectModal.totalCount',
    defaultMessage: '{total} items',
  },
  noItems: {
    id: 'EditDefectModal.noItems',
    defaultMessage: 'No similar items',
  },
  ignoreAa: {
    id: 'MakeDecisionModal.ignoreAa',
    defaultMessage: 'Ignore in Auto Analysis',
  },
  decisionForTest: {
    id: 'MakeDecisionModal.decisionForTest',
    defaultMessage: 'Decision for the test {launchNumber}',
  },
  selectDefectTypeManually: {
    id: 'MakeDecisionModal.selectDefectTypeManually',
    defaultMessage: 'Select defect type manually',
  },
  machineLearningSuggestions: {
    id: 'MakeDecisionModal.machineLearningSuggestions',
    defaultMessage: 'Machine learning suggestions',
  },
  applyImmediately: {
    id: 'MakeDecisionModal.applyImmediately',
    defaultMessage: 'Apply Immediately',
  },
  applyWithOptions: {
    id: 'MakeDecisionModal.applyWithOptions',
    defaultMessage: 'Apply with Options',
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
    defaultMessage: 'After a defect type submission, the current links will be unlink',
  },
});
