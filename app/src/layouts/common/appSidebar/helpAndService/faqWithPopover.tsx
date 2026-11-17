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

import { Popover } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { FAQContent } from 'layouts/common/appSidebar/helpAndService/FAQcontent';

import { PreviewPopover } from './previewPopoverContent';

import styles from './previewPopover.scss';

interface FAQWithPopoverProps {
  title: string;
  isFaqTouched: boolean;
  closePopover: VoidFn;
  closeSidebar: VoidFn;
  onOpen: VoidFn;
}

export const FAQWithPopover = ({
  title,
  isFaqTouched,
  closePopover,
  closeSidebar,
  onOpen,
}: FAQWithPopoverProps) => (
  <div className={styles['faq-popover-control']}>
    <Popover
      className={styles['faq-popover']}
      placement="right-start"
      content={
        <FAQContent closePopover={closePopover} closeSidebar={closeSidebar} onOpen={onOpen} />
      }
    >
      <PreviewPopover title={title} isFaqTouched={isFaqTouched} />
    </Popover>
  </div>
);
