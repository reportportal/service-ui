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

import { useSelector } from 'react-redux';
import { MIME_TYPES } from '@reportportal/ui-kit/fileDropArea';
import { FieldNumber } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields';

import { AttachmentArea } from '../createTestCaseModal/attachmentArea';
import { Precondition } from '../createTestCaseModal/testCaseDetails/precondition';
import { Steps } from '../createTestCaseModal/testCaseDetails/steps';
import { TextTemplate } from '../createTestCaseModal/testCaseDetails/textTemplate';
import { Requirements } from '../createTestCaseModal/testCaseDetails/requirements/requirements';
import { ManualScenarioType } from '../types';
import { manualScenarioTypeSelector, stepsDataSelector } from '../createTestCaseModal/selectors';
import { commonMessages } from '../commonMessages';
import { useStepsManagement } from '../hooks/useStepsManagement';
import { ScenarioFieldsProps } from './types';
import { createEmptyStep } from './constants';

import styles from './scenarioFields.scss';

const cx = createClassnames(styles);

export const ScenarioFields = ({ formName }: ScenarioFieldsProps) => {
  const { formatMessage } = useIntl();
  const manualScenarioType = useSelector(manualScenarioTypeSelector(formName));
  const stepsData = useSelector(stepsDataSelector(formName));

  const { steps, isEditMode, handleAddStep, handleRemoveStep, handleMoveStep, handleReorderSteps } =
    useStepsManagement({
      formName,
      stepsData,
      createEmptyStepFn: createEmptyStep,
    });

  const isTextTemplate = manualScenarioType === ManualScenarioType.TEXT;

  return (
    <div className={cx('scenario-fields')}>
      <FieldProvider name="executionEstimationTime">
        <div className={cx('scenario-fields__field')}>
          <FieldNumber
            min={1}
            label={formatMessage(commonMessages.executionTime)}
            onChange={() => {}}
          />
        </div>
      </FieldProvider>

      <div className={cx('scenario-fields__field')}>
        <Requirements />
      </div>

      {isTextTemplate ? (
        <>
          <div className={cx('scenario-fields__field')}>
            <Precondition />
          </div>
          <div className={cx('scenario-fields__field')}>
            <TextTemplate formName={formName} />
          </div>
        </>
      ) : (
        <>
          <div className={cx('scenario-fields__field')}>
            <AttachmentArea
              isNumerable={false}
              attachmentFieldName="preconditionAttachments"
              formName={formName}
              acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png]}
            >
              <Precondition />
            </AttachmentArea>
          </div>
          <div className={cx('scenario-fields__field')}>
            <FieldProvider name="steps">
              <Steps
                steps={steps}
                onAddStep={handleAddStep}
                onRemoveStep={handleRemoveStep}
                onMoveStep={handleMoveStep}
                onReorderSteps={handleReorderSteps}
                formName={formName}
                isKeyById={isEditMode}
              />
            </FieldProvider>
          </div>
        </>
      )}
    </div>
  );
};
