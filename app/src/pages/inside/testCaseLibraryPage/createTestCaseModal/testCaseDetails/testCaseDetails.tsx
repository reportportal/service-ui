import { useSelector } from 'react-redux';
import { MIME_TYPES } from '@reportportal/ui-kit/fileDropArea';

import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields';

import { Template } from './template';
import { AttachmentArea } from '../attachmentArea';
import { Precondition } from './precondition';
import { Steps } from './steps';
import { TextTemplate } from './textTemplate';
import { Requirements } from './requirements/requirements';
import { ManualScenarioType } from '../../types';
import { manualScenarioTypeSelector, stepsDataSelector } from '../selectors';
import { useStepsManagement } from '../../hooks/useStepsManagement';

import styles from './testCaseDetails.scss';

const cx = createClassnames(styles);

interface TestCaseDetailsProps {
  className?: string;
  formName: string;
  isTemplateFieldDisabled?: boolean;
}

export const TestCaseDetails = ({
  className,
  formName,
  isTemplateFieldDisabled = false,
}: TestCaseDetailsProps) => {
  const manualScenarioType = useSelector(manualScenarioTypeSelector(formName));
  const stepsData = useSelector(stepsDataSelector(formName));

  const { steps, isEditMode, handleAddStep, handleRemoveStep, handleMoveStep, handleReorderSteps } =
    useStepsManagement({
      formName,
      stepsData,
    });

  const isTextTemplate = manualScenarioType === ManualScenarioType.TEXT;

  return (
    <div className={cx('test-case-details', className)}>
      <Template isTemplateFieldDisabled={isTemplateFieldDisabled} />
      <Requirements />
      {isTextTemplate ? (
        <>
          <Precondition />
          <TextTemplate formName={formName} />
        </>
      ) : (
        <>
          <AttachmentArea
            isNumerable={false}
            attachmentFieldName="preconditionAttachments"
            formName={formName}
            acceptFileMimeTypes={[MIME_TYPES.jpeg, MIME_TYPES.png]}
          >
            <Precondition />
          </AttachmentArea>
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
        </>
      )}
    </div>
  );
};
