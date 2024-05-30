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
import { injectIntl } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { START_TIME_FORMAT_ABSOLUTE } from 'controllers/user';
import { langSelector } from 'controllers/lang';
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
  UPDATE_PROJECT,
  UPDATE_NOTIFICATIONS,
  CREATE_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
  MATCHED_PATTERN,
  ASSIGN_USER,
  UNASSIGN_USER,
  CHANGE_ROLE,
  CREATE_PROJECT,
  UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS,
} from 'common/constants/actionTypes';
import { AbsRelTime } from 'components/main/absRelTime';
import { externalSystemSelector } from 'controllers/project';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { COMMON_LOCALE_KEYS, months, days } from 'common/constants/localization';
import { DefaultProjectSettings } from './activities/defaultProjectSettings';
import { AnalysisProperties } from './activities/analysisProperties';
import { AnalysisConfigurations } from './activities/analysisConfigurations';
import { Integration } from './activities/integration';
import { Launch } from './activities/launch';
import { TestItem } from './activities/testItem';
import { CommonEntity } from './activities/commonEntity';
import { DefectType } from './activities/defectType';
import { Notifications } from './activities/notifications';
import styles from './projectActivity.scss';
import { AssignUser } from './activities/assignUser';
import { UnassignUser } from './activities/unassignUser';
import { ChangeRole } from './activities/changeRole';
import { CreateProject } from './activities/createProject';
import { UpdateAutoPatternAnalysis } from './activities/updatePatternAnalysis';
import { getProjectKey } from './activities/utils';

const cx = classNames.bind(styles);

// TODO: rewrite it when integrations will be added
@connect((state) => ({
  hasBts: externalSystemSelector(state).length > 0,
  lang: langSelector(state),
}))
@injectIntl
export class ProjectActivity extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object,
    hasBts: PropTypes.bool,
    lang: PropTypes.string,
  };
  static defaultProps = {
    widget: {
      content: {
        result: [],
      },
    },
    hasBts: false,
    lang: 'en',
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
      return intl.formatMessage(COMMON_LOCALE_KEYS.today);
    } else if (dateKey === yesterday) {
      return intl.formatMessage(COMMON_LOCALE_KEYS.yesterday);
    } else if (today - dateKey <= 604800000) {
      return days[dt.getDay()];
    }
    return `${intl.formatMessage(COMMON_LOCALE_KEYS[months[dt.getMonth()]])} ${dt.getDate()}`;
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
          <DefaultProjectSettings activity={activity} lang={this.props.lang} />
        );

      case ASSIGN_USER:
        return <AssignUser activity={activity} />;

      case UNASSIGN_USER:
        return <UnassignUser activity={activity} />;

      case CHANGE_ROLE:
        return <ChangeRole activity={activity} />;

      case CREATE_PROJECT:
        return <CreateProject activity={activity} />;

      case UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS:
        return <UpdateAutoPatternAnalysis activity={activity} />;

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
            <UserAvatar
              className={cx('avatar-wrapper')}
              userId={activity.user}
              projectKey={getProjectKey(activity)}
              alt="avatar"
            />
            <div className={cx('activity-wrapper')}>
              {ActivityComponent}
              <AbsRelTime
                setStartTimeFormatAction={START_TIME_FORMAT_ABSOLUTE}
                startTime={new Date(activity.lastModified).getTime()}
                customClass={cx('time')}
              />
            </div>
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
