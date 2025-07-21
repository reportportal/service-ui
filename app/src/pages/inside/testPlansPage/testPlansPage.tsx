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

import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptyTestPlans } from 'pages/inside/testPlansPage/emptyTestPlans';
import { BreadcrumbsTreeIcon } from '@reportportal/ui-kit';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { useSelector } from 'react-redux';
import { projectNameSelector } from 'controllers/project';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { messages } from './messages';
import styles from './testPlansPage.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const TestPlansPage = () => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <header className={cx('test-plans-page__header')}>
          <div className={cx('test-plans-page__breadcrumb')}>
            <BreadcrumbsTreeIcon />
            <Breadcrumbs descriptors={breadcrumbDescriptors} />
          </div>
          <h1>{formatMessage(messages.pageTitle)}</h1>
        </header>
        <EmptyTestPlans />
      </ScrollWrapper>
    </SettingsLayout>
  );
};
