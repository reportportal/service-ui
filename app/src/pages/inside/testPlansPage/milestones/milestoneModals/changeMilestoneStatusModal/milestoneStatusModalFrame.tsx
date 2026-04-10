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

import { type ReactNode } from 'react';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';

import styles from './changeMilestoneStatusModal.scss';

const cx = createClassnames(styles);

const MODAL_CLASS = cx('change-milestone-status-modal');
const CONTENT_CLASS = cx('change-milestone-status-modal__content');
const FOOTER_CLASS = cx('change-milestone-status-modal__footer');
const FOOTER_BUTTON_WRAP_CLASS = cx('change-milestone-status-modal__footer-button');

export type MilestoneStatusModalFrameProps = {
  title: ReactNode;
  allowCloseOutside?: boolean;
  onClose: () => void;
  isLoading: boolean;
  createFooter: (closeModal: () => void) => ReactNode;
  children: ReactNode;
  className?: string;
};

export const MilestoneStatusModalFrame = ({
  title,
  allowCloseOutside = true,
  onClose,
  isLoading,
  createFooter,
  children,
  className,
}: MilestoneStatusModalFrameProps) => (
  <Modal
    title={title}
    className={`${MODAL_CLASS} ${className}`}
    allowCloseOutside={allowCloseOutside}
    onClose={onClose}
    createFooter={createFooter}
  >
    <div className={CONTENT_CLASS}>
      <ModalLoadingOverlay isVisible={isLoading} />
      {children}
    </div>
  </Modal>
);

export const MilestoneStatusModalFooter = ({ children }: { children: ReactNode }) => (
  <div className={FOOTER_CLASS}>{children}</div>
);

export const MilestoneStatusModalFooterButtonWrap = ({ children }: { children: ReactNode }) => (
  <div className={FOOTER_BUTTON_WRAP_CLASS}>{children}</div>
);
