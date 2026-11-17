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

import { PropsWithChildren } from 'react';
import { createClassnames } from 'common/utils';
import styles from './pageLayout.scss';
import { PageBreadcrumbs } from './pageBreadcrumbs';

const cx = createClassnames(styles);

export const PageLayout = ({
  children,
  fullWidth = false,
}: PropsWithChildren<{ fullWidth?: boolean }>) => (
  <div className={cx('page-layout', { 'full-width': fullWidth })}>{children}</div>
);

export const PageHeader = ({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: unknown[] }>) => (
  <div className={cx('page-header')}>
    <PageBreadcrumbs data={breadcrumbs} />
    <div className={cx('children-container')}>{children}</div>
  </div>
);

export const PageSection = ({ children }: PropsWithChildren) => (
  <div className={cx('page-content')}>{children}</div>
);
