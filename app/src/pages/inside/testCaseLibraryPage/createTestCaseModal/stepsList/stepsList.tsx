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

import classNames from 'classnames/bind';
import { AttachmentArea } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/attachmentArea';
import { Step } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/testCaseDetails/steps/step';
import { StepData } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/testCaseDetails';
import styles from './stepsList.scss';

const cx = classNames.bind(styles);

interface StepsListProps {
  steps: StepData[];
}

export const StepsList = ({ steps }: StepsListProps) => {
  return (
    <div className={cx('steps-list')}>
      {steps.map((step, index) => {
        const { instructions, expectedResult, id } = step;
        return (
          <div key={id} className={cx('step-item')}>
            <AttachmentArea
              isDraggable={false}
              isDragAndDropIconVisible={false}
              isAttachmentBlockVisible={false}
              index={index}
              canAttachFiles={false}
            >
              <Step
                stepId={id}
                isReadMode
                instructions={instructions}
                expectedResult={expectedResult}
              />
            </AttachmentArea>
          </div>
        );
      })}
    </div>
  );
};
