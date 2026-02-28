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

import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { noop } from 'es-toolkit';
import {
  BubblesLoader,
  Button,
  Modal,
  PlusIcon,
} from '@reportportal/ui-kit';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import { useModalButtons } from '../../hooks/useModalButtons';
import { messages } from './messages';
import { EditableTagsSection } from '../../editableTagsSection';
import { useBatchEditTags } from '../../hooks/useBatchEditTags';
import { TagPopover } from '../../tagPopover';
import { Tag } from '../../types';
import { useFormFieldValue } from '../../hooks/useFormFieldValue';

import styles from './batchEditTagsModal.scss';

const cx = createClassnames(styles);

export const BATCH_EDIT_TAGS_MODAL_KEY = 'batchEditTagsModalKey';
const BATCH_EDIT_TAGS_FORM_NAMES = {
  form: 'batchEditTagsForm',
  tagsToRemove: 'tagsToRemove',
  tagsToAdd: 'tagsToAdd',
};

export interface BatchEditTagsModalData {
  selectedTestCaseIds: number[];
  count: number;
  onClearSelection: () => void;
}
type BatchEditTagsModalProps = UseModalData<BatchEditTagsModalData>;
type BatchEditTagsModalFormValues = {
  tagsToRemove: string[];
  tagsToAdd: string[];
}

const BatchEditTagsModal = reduxForm<
  BatchEditTagsModalFormValues,
  BatchEditTagsModalProps
>({
  form: BATCH_EDIT_TAGS_FORM_NAMES.form,
  destroyOnUnmount: true,
})(({
  dirty,
  pristine,
  data: {
    selectedTestCaseIds = [],
    count = 0,
    onClearSelection,
  },
  handleSubmit,
  change,
}: BatchEditTagsModalProps & InjectedFormProps<BatchEditTagsModalFormValues, BatchEditTagsModalProps>) => {
  const { formatMessage } = useIntl();
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const {
    getTags,
    updateTags,
    isLoadingTagsUpdating,
    isLoadingTags,
  } = useBatchEditTags({ onSuccess: onClearSelection });
  const tagsToRemove = useFormFieldValue({
    formName: BATCH_EDIT_TAGS_FORM_NAMES.form,
    fieldName: BATCH_EDIT_TAGS_FORM_NAMES.tagsToRemove,
  });
  const tagsToAdd = useFormFieldValue({
    formName: BATCH_EDIT_TAGS_FORM_NAMES.form,
    fieldName: BATCH_EDIT_TAGS_FORM_NAMES.tagsToAdd,
  });
  const safeTagsToRemove = (Array.isArray(tagsToRemove) ? tagsToRemove : []) as string[];
  const safeTagsToAdd = (Array.isArray(tagsToAdd) ? tagsToAdd : []) as string[];
  const isLoading = isLoadingTags || isLoadingTagsUpdating;

  useEffect(() => {
    getTags({ testCaseIds: selectedTestCaseIds })
      .then((data) => {
        setTagsList(data?.content);
      })
      .catch(noop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRemoveTag = (tagKey: string): void => {
    let tagToRemove: Tag;
    const updatedTags = tagsList.filter((tag: Tag) => {
      if (tag.key !== tagKey) {
        return true;
      }

      tagToRemove = tag;
    });

    change(BATCH_EDIT_TAGS_FORM_NAMES.tagsToRemove, [...safeTagsToRemove, tagToRemove.key]);
    change(BATCH_EDIT_TAGS_FORM_NAMES.tagsToAdd, safeTagsToAdd?.filter((key: string) => key !== tagToRemove.key));

    setTagsList(updatedTags);
  };

  const onAddTag = (tag: Tag): void => {
    change(BATCH_EDIT_TAGS_FORM_NAMES.tagsToRemove, safeTagsToRemove?.filter((key: string) => key !== tag.key));
    change(BATCH_EDIT_TAGS_FORM_NAMES.tagsToAdd, [...safeTagsToAdd, tag.key]);

    setTagsList([...tagsList, tag]);
  };

  const onSubmit = (values: BatchEditTagsModalFormValues): void => {
    updateTags({
      testCaseIds: selectedTestCaseIds,
      attributeKeysToRemove: values.tagsToRemove,
      attributeKeysToAdd: values.tagsToAdd,
    })
      .catch(noop);
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    isLoading,
    isSubmitButtonDisabled: pristine,
    onSubmit: handleSubmit(onSubmit) as () => void,
  });

  const tagAddButton = (
    <TagPopover
      onTagSelect={onAddTag}
      selectedTags={tagsList}
      placement="bottom-end"
      trigger={
        <Button variant="text" adjustWidthOn="content" icon={<PlusIcon/>} disabled={isLoadingTags}>
          {formatMessage(messages.batchEditTagsModalAddButton)}
        </Button>
      }
    />
  );

  return (
    <Modal
      title={formatMessage(messages.batchEditTagsModalTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form>
        <p className={cx('batch-edit-tags-modal__description')}>
          {formatMessage(
            messages.batchEditTagsModalDescription,
            {
              count,
              b: (text) => <b>{text}</b>,
            },
          )}
        </p>
        {
          isLoadingTags ?
            <BubblesLoader className={cx('batch-edit-tags-modal__loader')} /> : (
            <EditableTagsSection
              variant="modal"
              addButton={tagAddButton}
              tags={tagsList}
              onTagRemove={onRemoveTag}
              title={formatMessage(messages.batchEditTagsModalSimilarTags)}
              emptyMessage={formatMessage(messages.batchEditTagsModalNoTags)}
            />
          )
        }
        <ModalLoadingOverlay isVisible={isLoading}/>
      </form>
    </Modal>
  );
});

export default withModal(BATCH_EDIT_TAGS_MODAL_KEY)(BatchEditTagsModal);
