import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptyMilestones } from 'pages/inside/milestonesPage/emptyMilestones';
import { BreadcrumbsTreeIcon } from '@reportportal/ui-kit';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { useSelector } from 'react-redux';
import { projectNameSelector } from 'controllers/project';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { messages } from './messages';
import styles from './milestonesPage.scss';

const cx = classNames.bind(styles);

export const MilestonePage = () => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <header className={cx('milestones-page__header')}>
          <div className={cx('milestones-page__breadcrumb')}>
            <BreadcrumbsTreeIcon />
            <Breadcrumbs descriptors={breadcrumbDescriptors} />
          </div>
          <h1>{formatMessage(messages.pageTitle)}</h1>
        </header>
        <EmptyMilestones />
      </ScrollWrapper>
    </SettingsLayout>
  );
};
