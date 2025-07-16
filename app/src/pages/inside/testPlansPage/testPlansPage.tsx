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

const cx = classNames.bind(styles);

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
