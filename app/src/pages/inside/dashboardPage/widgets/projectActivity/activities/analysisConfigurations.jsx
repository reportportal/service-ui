import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { ANALYSIS } from 'common/constants/settingTabs';
import styles from './common.scss';

const cx = classNames.bind(styles);

export const AnalysisConfigurations = ({ activity }) => (
  <Fragment>
    <span className={cx('user-name')}>{activity.userRef}</span>
    <FormattedMessage id="AnalysisConfigurations.update" defaultMessage="updated" />
    <a className={cx('link')} target="_blank" href={`#${activity.projectRef}/settings/${ANALYSIS}`}>
      <FormattedMessage
        id="AnalysisConfigurations.analysisConfigurations"
        defaultMessage="Auto-Analysis configurations:"
      />
    </a>
    {activity.actionType === 'generate_index' ? (
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
