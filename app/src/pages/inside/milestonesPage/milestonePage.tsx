import { FC } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptyMilestones } from 'pages/inside/milestonesPage/emptyMilestones';
import { messages } from './messages';
import styles from './milestonesPage.scss';

const cx = classNames.bind(styles);

type MilestonePageProps = {
  // add required props types
};

export const MilestonePage: FC<MilestonePageProps> = () => {
  const { formatMessage } = useIntl();

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <header className={cx('milestones-page__header')}>
          <h1>{formatMessage(messages.pageTitle)}</h1>
        </header>
        <EmptyMilestones />
      </ScrollWrapper>
    </SettingsLayout>
  );
};
