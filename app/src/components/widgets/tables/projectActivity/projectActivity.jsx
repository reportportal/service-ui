import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { START_TIME_FORMAT_ABSOLUTE } from 'controllers/user';
import {
  ACTION_TO_GROUP_MAP,
  ACTIONS_WITH_ISSUES,
  ACTIONS_WITH_DASHBOARDS,
  ACTIONS_WITH_WIDGETS,
  ACTIONS_WITH_FILTERS,
  ACTIONS_WITH_BTS,
  ACTIONS_WITH_AA_SETTINGS,
  ACTIONS_WITH_DEFECTS,
  ACTIONS_WITH_IMPORT,
  ACTIONS_WITH_NOTIFICATIONS,
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  UPDATE_ANALYZER,
  CREATE_USER,
  UPDATE_PROJECT,
  UPDATE_EMAIL,
  OFF_EMAIL,
  ON_EMAIL,
} from 'common/constants/actionTypes';
import { URLS } from 'common/urls';
import { AbsRelTime } from 'components/main/absRelTime';
import { externalSystemSelector } from 'controllers/project';
import { DefaultProjectSettings } from './activities/defaultProjectSettings';
import { AnalysisProperties } from './activities/analysisProperties';
import { AnalysisConfigurations } from './activities/analysisConfigurations';
import { Bts } from './activities/bts';
import { Launch } from './activities/launch';
import { TestItem } from './activities/testItem';
import { CreateUser } from './activities/createUser';
import { CommonEntity } from './activities/commonEntity';
import { DefectType } from './activities/defectType';
import { Notifications } from './activities/notifications';
import styles from './projectActivity.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  january: {
    id: 'ProjectActivity.january',
    defaultMessage: 'January',
  },
  february: {
    id: 'ProjectActivity.february',
    defaultMessage: 'February',
  },
  march: {
    id: 'ProjectActivity.march',
    defaultMessage: 'March',
  },
  april: {
    id: 'ProjectActivity.april',
    defaultMessage: 'April',
  },
  may: {
    id: 'ProjectActivity.may',
    defaultMessage: 'May',
  },
  june: {
    id: 'ProjectActivity.june',
    defaultMessage: 'June',
  },
  july: {
    id: 'ProjectActivity.july',
    defaultMessage: 'July',
  },
  august: {
    id: 'ProjectActivity.august',
    defaultMessage: 'August',
  },
  september: {
    id: 'ProjectActivity.september',
    defaultMessage: 'September',
  },
  october: {
    id: 'ProjectActivity.october',
    defaultMessage: 'October',
  },
  november: {
    id: 'ProjectActivity.november',
    defaultMessage: 'November',
  },
  december: {
    id: 'ProjectActivity.december',
    defaultMessage: 'December',
  },
  today: {
    id: 'ProjectActivity.today',
    defaultMessage: 'Today',
  },
  yesterday: {
    id: 'ProjectActivity.yesterday',
    defaultMessage: 'Yesterday',
  },
  monday: {
    id: 'ProjectActivity.monday',
    defaultMessage: 'Monday',
  },
  tuesday: {
    id: 'ProjectActivity.tuesday',
    defaultMessage: 'Tuesday',
  },
  wednesday: {
    id: 'ProjectActivity.wednesday',
    defaultMessage: 'Wednesday',
  },
  thursday: {
    id: 'ProjectActivity.thursday',
    defaultMessage: 'Thursday',
  },
  friday: {
    id: 'ProjectActivity.friday',
    defaultMessage: 'Friday',
  },
  saturday: {
    id: 'ProjectActivity.saturday',
    defaultMessage: 'Saturday',
  },
  sunday: {
    id: 'ProjectActivity.sunday',
    defaultMessage: 'Sunday',
  },
});
const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@connect((state) => ({
  hasBts: externalSystemSelector(state).length > 0,
}))
@injectIntl
export class ProjectActivity extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.array,
    hasBts: PropTypes.bool,
  };
  static defaultProps = {
    activity: [],
    hasBts: false,
  };

  getActivities = () => {
    const dates = [];
    const activities = this.props.activity;
    activities.forEach((activity) => {
      let dateKey;
      let contains;
      let values;
      if (this.isValidActivity(activity)) {
        if (activity.values.actionType === UPDATE_PROJECT) {
          values = this.updateProjectValues(activity);
        } else if (activity.values.actionType === UPDATE_ANALYZER) {
          values = this.updateAnalyzerOptions(activity);
        } else {
          values = Object.assign(
            {
              id: activity.id,
            },
            activity.values,
          );
        }
        dateKey = this.getDayKey(values.lastModified);
        contains = dates.find((item) => item.day === dateKey);
        if (contains) {
          contains.items.push(values);
        } else {
          dates.push({
            day: dateKey,
            dayTitle: this.getDateTitle(dateKey),
            items: [values],
          });
        }
      }
    });
    return dates;
  };

  getDayKey = (lastModified) => {
    const date = new Date(parseFloat(lastModified));
    const dateWoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Date.parse(dateWoTime);
  };

  getDateTitle = (dateKey) => {
    const { intl } = this.props;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();
    const yesterday = new Date(today - 86400000).valueOf();
    const dt = new Date(parseFloat(dateKey));
    if (dateKey === today) {
      return intl.formatMessage(messages.today);
    } else if (dateKey === yesterday) {
      return intl.formatMessage(messages.yesterday);
    } else if (today - dateKey <= 604800000) {
      return days[dt.getDay()];
    }
    return `${intl.formatMessage(messages[months[dt.getMonth()]])} ${dt.getDate()}`;
  };

  getUserAvatar = (activity) => {
    const avatarUrl = URLS.dataPhoto(activity.userRef, Date.now());
    return <img className={cx('avatar')} src={avatarUrl} alt="avatar" />;
  };

  updateProjectValues = (activity) => {
    const values = {
      id: activity.id,
      history: {},
    };
    Object.keys(activity.values).forEach((k) => {
      let a = k.split('$');
      let name = a[0];
      let type = a[1];
      const obj = {};
      if (k.indexOf('Value') > 0) {
        if (k === 'emailEnabled$newValue') {
          values.actionType = activity.values[k] === 'false' ? OFF_EMAIL : ON_EMAIL;
        } else if (k === 'emailCases$newValue') {
          values.actionType = UPDATE_EMAIL;
        } else {
          a = k.split('$');
          name = a[0];
          type = a[1];
          obj[type] = activity.values[k];
          if (values.history[name]) {
            values.history[name] = Object.assign(values.history[name], obj);
          } else {
            values.history[name] = obj;
          }
        }
      }
      values[k] = activity.values[k];
    });
    return values;
  };

  updateAnalyzerOptions = (activity) => {
    const values = {
      id: activity.id,
      history: {},
    };
    Object.keys(activity.values).forEach((k) => {
      let a = k.split('$');
      let name = a[0];
      let type = a[1];
      const obj = {};
      if (k.indexOf('Value') > 0) {
        a = k.split('$');
        name = a[0];
        type = a[1];
        obj[type] = activity.values[k];
        if (values.history[name]) {
          values.history[name] = Object.assign(values.history[name], obj);
        } else {
          values.history[name] = obj;
        }
      }
      values[k] = activity.values[k];
    });
    return values;
  };

  isValidActivity = (activity) =>
    !(
      !this.props.hasBts &&
      activity.values.objectType === 'testItem' &&
      activity.values.actionType.indexOf('issue') > 0
    );

  selectActivitiesComponent = (activity) => {
    const actionGroup = ACTION_TO_GROUP_MAP[activity.actionType] || activity.actionType;
    switch (actionGroup) {
      case ACTIONS_WITH_ISSUES:
        return <TestItem activity={activity} />;
      case ACTIONS_WITH_DASHBOARDS:
      case ACTIONS_WITH_WIDGETS:
      case ACTIONS_WITH_FILTERS:
        return <CommonEntity activity={activity} />;
      case ACTIONS_WITH_BTS:
        return <Bts activity={activity} />;
      case ACTIONS_WITH_AA_SETTINGS:
        return activity.actionType === UPDATE_ANALYZER ? (
          <AnalysisProperties activity={activity} />
        ) : (
          <AnalysisConfigurations activity={activity} />
        );
      case ACTIONS_WITH_DEFECTS:
        return <DefectType activity={activity} />;
      case ACTIONS_WITH_IMPORT:
      case START_LAUNCH:
      case FINISH_LAUNCH:
      case DELETE_LAUNCH:
        return <Launch activity={activity} />;
      case UPDATE_PROJECT:
        return <DefaultProjectSettings activity={activity} />;
      case CREATE_USER:
        return <CreateUser activity={activity} />;
      case ACTIONS_WITH_NOTIFICATIONS:
        return <Notifications activity={activity} />;
      default:
        return null;
    }
  };

  renderDateActivity = (date) =>
    date.items.map((activity) => {
      const ActivityComponent = this.selectActivitiesComponent(activity);
      return (
        ActivityComponent && (
          <div className={cx('row-content')} key={activity.id}>
            {activity.actionType === CREATE_USER ? (
              <Fragment>
                {ActivityComponent}
                <AbsRelTime
                  setStartTimeFormatAction={START_TIME_FORMAT_ABSOLUTE}
                  startTime={+activity.lastModified}
                  customClass={cx('time')}
                />
              </Fragment>
            ) : (
              <Fragment>
                {this.getUserAvatar(activity)}
                <div className={cx('clearfix')}>
                  {ActivityComponent}
                  <AbsRelTime
                    setStartTimeFormatAction={START_TIME_FORMAT_ABSOLUTE}
                    startTime={+activity.lastModified}
                    customClass={cx('time')}
                  />
                </div>
              </Fragment>
            )}
          </div>
        )
      );
    });
  render() {
    const dates = this.getActivities();
    return (
      <div className={cx('project-activity')}>
        <div className={cx('widget-wrapper')}>
          <ScrollWrapper>
            {dates.map((date) => (
              <Fragment key={date.day}>
                <p className={cx('day-title')}>{date.dayTitle}</p>
                {this.renderDateActivity(date)}
              </Fragment>
            ))}
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
