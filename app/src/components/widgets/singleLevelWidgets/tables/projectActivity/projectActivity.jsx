/*
 * Copyright 2019 EPAM Systems
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

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { START_TIME_FORMAT_ABSOLUTE } from 'controllers/user';
import {
  ACTION_TO_GROUP_MAP,
  ACTIONS_WITH_ISSUES,
  ACTIONS_WITH_DASHBOARDS,
  ACTIONS_WITH_WIDGETS,
  ACTIONS_WITH_FILTERS,
  ACTIONS_WITH_INTEGRATIONS,
  ACTIONS_WITH_AA_SETTINGS,
  ACTIONS_WITH_DEFECTS,
  ACTIONS_WITH_IMPORT,
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  UPDATE_ANALYZER,
  CREATE_USER,
  UPDATE_PROJECT,
  UPDATE_NOTIFICATIONS,
  CREATE_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
  MATCHED_PATTERN,
} from 'common/constants/actionTypes';
import { AbsRelTime } from 'components/main/absRelTime';
import { externalSystemSelector } from 'controllers/project';
import { projectIdSelector } from 'controllers/pages';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { DefaultProjectSettings } from './activities/defaultProjectSettings';
import { AnalysisProperties } from './activities/analysisProperties';
import { AnalysisConfigurations } from './activities/analysisConfigurations';
import { Integration } from './activities/integration';
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

// TODO: rewrite it when integrations will be added
@connect((state) => ({
  hasBts: externalSystemSelector(state).length > 0,
  projectId: projectIdSelector(state),
}))
@injectIntl
export class ProjectActivity extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    widget: PropTypes.object,
    hasBts: PropTypes.bool,
  };
  static defaultProps = {
    widget: {
      content: {
        result: [],
      },
    },
    hasBts: false,
  };

  getActivities = () => {
    const dates = [];
    const { result = [] } = this.props.widget.content;

    result.forEach((activity) => {
      let dateKey;
      let contains;
      let values;
      if (this.isValidActivity(activity)) {
        values = activity;
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

  isValidActivity = (activity) =>
    !(
      !this.props.hasBts &&
      activity.objectType === 'testItem' &&
      activity.actionType.indexOf('issue') > 0
    );

  selectActivitiesComponent = (activity) => {
    const actionGroup = ACTION_TO_GROUP_MAP[activity.actionType] || activity.actionType;
    switch (actionGroup) {
      case ACTIONS_WITH_ISSUES:
        return <TestItem activity={activity} />;
      case ACTIONS_WITH_DASHBOARDS:
      case ACTIONS_WITH_WIDGETS:
      case ACTIONS_WITH_FILTERS:
      case CREATE_PATTERN:
      case DELETE_PATTERN:
      case UPDATE_PATTERN:
      case MATCHED_PATTERN:
        return <CommonEntity activity={activity} />;
      case ACTIONS_WITH_INTEGRATIONS:
        return <Integration activity={activity} />;
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
        return activity.objectType === UPDATE_NOTIFICATIONS ? (
          <Notifications activity={activity} />
        ) : (
          <DefaultProjectSettings activity={activity} />
        );
      case CREATE_USER:
        return <CreateUser activity={activity} />;
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
                <UserAvatar
                  className={cx('avatar-wrapper')}
                  userId={activity.user}
                  projectId={this.props.projectId}
                  alt="avatar"
                />
                <div className={cx('activity-wrapper')}>
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
        <ScrollWrapper>
          <div className={cx('widget-wrapper')}>
            {dates.map((date) => (
              <Fragment key={date.day}>
                <p className={cx('day-title')}>{date.dayTitle}</p>
                {this.renderDateActivity(date)}
              </Fragment>
            ))}
          </div>
        </ScrollWrapper>
      </div>
    );
  }
}
