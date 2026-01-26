/*
 * Copyright 2025 EPAM Systems
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

import { useCallback, useState, Ref } from 'react';
import { useIntl } from 'react-intl';
import { useDrop } from 'react-dnd';
import { Button, PlusIcon, DragNDropIcon, SortableItem, DragLayer } from '@reportportal/ui-kit';
import { DROP_DETECTION_MODE } from '@reportportal/ui-kit/common';
import { MIME_TYPES } from '@reportportal/ui-kit/fileDropArea';

import { createClassnames } from 'common/utils';

import { AttachmentArea } from '../../attachmentArea';
import { Step } from './step';
import { messages as commonMessages } from '../../messages';
import { messages } from './messages';
import { StepsProps } from './types';
import { HideOnDrag } from './HideOnDrag';

import styles from './steps.scss';

const cx = createClassnames(styles);

const STEP_DRAG_TYPE = 'TEST_CASE_STEP';
const DROP_ANIMATION_DURATION = 600;

export const Steps = ({
  steps,
  onAddStep,
  onRemoveStep,
  onMoveStep,
  onReorderSteps,
  formName,
  isKeyById = false,
}: StepsProps) => {
  const { formatMessage } = useIntl();
  const [justDroppedId, setJustDroppedId] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDrop = useCallback(
    (fromIndex: number, toIndex: number) => {
      setDraggingIndex(null);

      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
        return;
      }

      const reorderedSteps = [...steps];
      const [movedStep] = reorderedSteps.splice(fromIndex, 1);
      reorderedSteps.splice(toIndex, 0, movedStep);

      setJustDroppedId(movedStep.id);
      setTimeout(() => setJustDroppedId(null), DROP_ANIMATION_DURATION);

      onReorderSteps(reorderedSteps);
    },
    [steps, onReorderSteps],
  );

  // Detect when any step is being dragged to show dotted border around the zone
  const [{ isDraggingAny }, dropZoneRef] = useDrop(
    () => ({
      accept: STEP_DRAG_TYPE,
      collect: (monitor) => ({
        isDraggingAny: monitor.canDrop(),
      }),
      drop: () => {
        return { droppedInZone: true };
      },
    }),
    [],
  );

  const renderBetweenStepsArea = (index: number) => {
    const isLastStep = index === steps.length - 1;

    if (isDraggingAny) {
      return null;
    }

    return (
      !isLastStep && (
        <div className={cx('steps__between-area')}>
          <Button
            icon={<PlusIcon />}
            className={cx('steps__floating-button')}
            variant="text"
            adjustWidthOn="content"
            onClick={() => onAddStep(index)}
          >
            {formatMessage(messages.addStep)}
          </Button>
        </div>
      )
    );
  };

  return (
    <div className={cx('steps')}>
      <DragLayer
        type={STEP_DRAG_TYPE}
        previewClassName={cx('drag-preview')}
        renderPreview={(item) => (
          <>
            <DragNDropIcon />
            <span>Step {item.index + 1}</span>
          </>
        )}
      />
      <span className={cx('steps__label')}>{formatMessage(messages.steps)}</span>
      <div
        ref={dropZoneRef}
        className={cx('steps__list', { 'steps__list--dragging': isDraggingAny })}
      >
        {steps.map((step, index) => {
          const { id, instructions, expectedResult } = step;
          const fieldKey = isKeyById ? id : index;
          const isLast = index === steps.length - 1;
          const isDraggingThis = draggingIndex === index;

          return (
            <>
              <SortableItem
                key={id}
                id={id}
                index={index}
                type={STEP_DRAG_TYPE}
                onDrop={handleDrop}
                hideDefaultPreview
                dropDetectionMode={DROP_DETECTION_MODE.HOVER}
                isLast={isLast}
                className={cx('steps__step-container', {
                  'steps__step-container--just-dropped': justDroppedId === id,
                  'steps__step-container--last': isLast,
                  'steps__step-container--is-dragging': isDraggingThis,
                })}
                draggingClassName={cx('steps__step-container--dragging')}
                dropTargetClassName={cx('steps__step-container--drop-target')}
              >
                {({ dragRef, isDragging }) => (
                  <HideOnDrag
                    isDragging={isDragging}
                    index={index}
                    draggingIndex={draggingIndex}
                    onDraggingChange={setDraggingIndex}
                  >
                    <AttachmentArea
                      isDraggable
                      index={index}
                      totalCount={steps.length}
                      formName={formName}
                      acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                      dropZoneDescription={formatMessage(commonMessages.dropFileDescription, {
                        browseButton: formatMessage(commonMessages.browseText),
                      })}
                      attachmentFieldName={`steps.${fieldKey}.attachments`}
                      fileSizeMessage={formatMessage(commonMessages.fileSizeInfo)}
                      onRemove={() => onRemoveStep(id)}
                      onMove={(direction) => onMoveStep({ stepId: id, direction })}
                      dragHandleRef={dragRef as Ref<HTMLButtonElement>}
                      isDraggingActive={isDragging}
                    >
                      <Step
                        stepId={fieldKey}
                        instructions={instructions}
                        expectedResult={expectedResult}
                      />
                    </AttachmentArea>
                    {renderBetweenStepsArea(index)}
                  </HideOnDrag>
                )}
              </SortableItem>
            </>
          );
        })}
      </div>
      <div>
        <Button
          icon={<PlusIcon />}
          variant="text"
          adjustWidthOn="content"
          onClick={() => onAddStep()}
        >
          {formatMessage(messages.addStep)}
        </Button>
      </div>
    </div>
  );
};
