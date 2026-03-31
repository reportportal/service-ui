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

import { PropsWithChildren } from 'react';
import { Layout } from 'layouts/common/layout';
import { dashboardFullWidthModeSelector } from 'controllers/dashboard';
import { pageSelector, PROJECT_DASHBOARD_ITEM_PAGE } from 'controllers/pages';
import { useFullSelector } from 'hooks/useTypedSelector';
import { AppState } from 'types/store';
import { HeaderLayout } from '../headerLayout';
import { ProjectSidebar } from './projectSidebar';
import { AppBanner } from './appBanner';

type ProjectLayoutProps = PropsWithChildren<{
  rawContent?: boolean;
}>;

export const ProjectLayout = ({
  children,
  rawContent = false,
}: ProjectLayoutProps) => {
  const page = useFullSelector((state: AppState) => pageSelector(state) as string | undefined);
  const fullWidthMode = useFullSelector((state: AppState) =>
    Boolean(dashboardFullWidthModeSelector(state)),
  );

  return (
    <Layout
      Header={HeaderLayout}
      Sidebar={ProjectSidebar}
      Banner={AppBanner}
      rawContent={rawContent}
      fullWidthContainer={page === PROJECT_DASHBOARD_ITEM_PAGE && fullWidthMode}
    >
      {children}
    </Layout>
  );
};
