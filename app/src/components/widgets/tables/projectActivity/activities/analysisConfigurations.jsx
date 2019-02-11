import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { FormattedMessage } from 'react-intl';
import { ANALYSIS } from 'common/constants/settingsTabs';
import { GENERATE_INDEX } from 'common/constants/actionTypes';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

export const AnalysisConfigurations = ({ activity }) => (
  <Fragment>
    <span className={cx('user-name')}>{activity.user}</span>
    <FormattedMessage id="AnalysisConfigurations.update" defaultMessage="updated" />
    <Link
      to={getProjectSettingTabPageLink(activity.projectName, ANALYSIS)}
      className={cx('link')}
      target="_blank"
    >
      <FormattedMessage
        id="AnalysisConfigurations.analysisConfigurations"
        defaultMessage="Auto-Analysis configurations:"
      />
    </Link>
    {activity.actionType === GENERATE_INDEX ? (
      <FormattedMessage id="AnalysisConfigurations.generateIndex" defaultMessage="generate index" />
    ) : (
      <FormattedMessage id="AnalysisConfigurations.removeIndex" defaultMessage="remove index" />
    )}
  </Fragment>
);

AnalysisConfigurations.propTypes = {
  activity: PropTypes.object,
};
AnalysisConfigurations.defaultProps = {
  activity: {},
};
