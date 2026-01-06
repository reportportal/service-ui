import { UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS } from 'common/constants/actionTypes';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { PATTERN_ANALYSIS } from 'common/constants/settingsTabs';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';
import styles from './common.scss';
import { getProjectSettingTabPageLink } from './utils';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [`${UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS}_ACTION`]: {
    id: 'UpdateAutoPatternAnalysisSettings.updated',
    defaultMessage: 'updated',
  },
  [`${UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS}_DESCRIPTION`]: {
    id: 'UpdateAutoPatternAnalysisSettings.description',
    defaultMessage: 'switch from {oldValue} to {newValue}.',
  },
  [`${UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS}_LINK`]: {
    id: 'UpdateAutoPatternAnalysisSettings.linkText',
    defaultMessage: 'Pattern-Analysis properties:',
  },
});

const getValue = ({ history: [{ oldValue, newValue }] = [{ oldValue: '', newValue: '' }] }) => {
  return { oldValue: JSON.parse(oldValue), newValue: JSON.parse(newValue) };
};

export const UpdateAutoPatternAnalysis = ({ activity }) => {
  const { formatMessage } = useIntl();
  const { user, details, organizationSlug, projectSlug } = activity;
  const { oldValue, newValue } = getValue(details);

  return (
    <>
      <span className={cx('user-name')}>{user}</span>
      <span>{formatMessage(messages.updatePatternAnalysisSettings_ACTION)}</span>
      <Link
        className={cx('link')}
        target="_blank"
        to={getProjectSettingTabPageLink(organizationSlug, projectSlug, PATTERN_ANALYSIS)}
      >
        {formatMessage(messages.updatePatternAnalysisSettings_LINK)}
      </Link>
      <span>
        {formatMessage(messages.updatePatternAnalysisSettings_DESCRIPTION, {
          oldValue: oldValue ? 'ON' : 'OFF',
          newValue: newValue ? 'ON' : 'OFF',
        })}
      </span>
    </>
  );
};
UpdateAutoPatternAnalysis.propTypes = activityItemPropTypes;
UpdateAutoPatternAnalysis.defaultProps = activityItemDefaultProps;
