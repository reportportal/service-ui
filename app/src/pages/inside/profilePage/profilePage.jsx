import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { PageLayout } from 'layouts/pageLayout';
import { PersonalInfoBlock } from './personalInfoBlock';
import { UuidBlock } from './uuidBlock';
import { AssignedProjectsBlock } from './assignedProjectsBlock';
import { ConfigExamplesBlock } from './configExamplesBlock';
import { LocalizationBlock } from './localizationBlock';
import styles from './profilePage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  profilePageTitle: {
    id: 'ProfilePage.title',
    defaultMessage: 'User profile',
  },
});
@injectIntl
export class ProfilePage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render = () => {
    const { intl } = this.props;
    return (
      <PageLayout title={intl.formatMessage(messages.profilePageTitle)}>
        <div className={cx('container')}>
          <div className={cx('column')}>
            <PersonalInfoBlock />
            <AssignedProjectsBlock />
            <LocalizationBlock />
          </div>
          <div className={cx('column')}>
            <UuidBlock />
            <ConfigExamplesBlock />
          </div>
        </div>
      </PageLayout>
    );
  };
}
