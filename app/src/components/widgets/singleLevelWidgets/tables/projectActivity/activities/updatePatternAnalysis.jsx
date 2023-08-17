import { UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS } from 'common/constants/actionTypes';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { PATTERN_ANALYSIS } from 'common/constants/settingsTabs';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
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
    defaultMessage: 'properties switch from {oldValue} to {newValue}.',
  },
});

const getValue = ({ history: [{ oldValue, newValue }] = [{ oldValue: '', newValue: '' }] }) => {
  return { oldValue: JSON.parse(oldValue), newValue: JSON.parse(newValue) };
};

export const UpdateAutoPatternAnalysis = ({ activity: { user, projectName, details } }) => {
  const { formatMessage } = useIntl();

  const { oldValue, newValue } = getValue(details);

  return (
    <>
      <span className={cx('user-name')}>{user}</span>
      <span>{formatMessage(messages.updateAutoPatternAnalysisSettings_ACTION)}</span>
      <Link
        className={cx('link')}
        target="_blank"
        to={getProjectSettingTabPageLink(projectName, PATTERN_ANALYSIS)}
      >
        {formatMessage(COMMON_LOCALE_KEYS.PATTERN_ANALYSIS)}
      </Link>
      <span>
        {formatMessage(messages.updateAutoPatternAnalysisSettings_DESCRIPTION, {
          oldValue: oldValue ? 'ON' : 'OFF',
          newValue: newValue ? 'ON' : 'OFF',
        })}
      </span>
    </>
  );
};
UpdateAutoPatternAnalysis.propTypes = activityItemPropTypes;
UpdateAutoPatternAnalysis.defaultProps = activityItemDefaultProps;
