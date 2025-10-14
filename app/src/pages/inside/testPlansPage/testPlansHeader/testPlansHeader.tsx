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

import { ReactNode } from 'react';
import { BreadcrumbsTreeIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';

import styles from './testPlansHeader.scss';

const cx = createClassnames(styles);

interface BreadcrumbDescriptor {
  id: string;
  title: string;
  onClick?: VoidFunction;
}

interface TestPlansHeaderProps {
  title: string;
  breadcrumbDescriptors: BreadcrumbDescriptor[];
  actions?: ReactNode;
}

export const TestPlansHeader = ({
  title,
  breadcrumbDescriptors = [],
  actions,
}: TestPlansHeaderProps) => (
  <header className={cx('test-plans-header')}>
    <div className={cx('test-plans-header__breadcrumb')}>
      <BreadcrumbsTreeIcon />
      <Breadcrumbs descriptors={breadcrumbDescriptors} />
    </div>
    <div className={cx('test-plans-header__title-row')}>
      <h1 className={cx('test-plans-header__title')}>{title}</h1>
      {actions && <div className={cx('test-plans-header__actions')}>{actions}</div>}
    </div>
  </header>
);
