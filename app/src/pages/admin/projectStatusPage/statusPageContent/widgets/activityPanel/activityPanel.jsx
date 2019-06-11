import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ProjectActivity } from 'components/widgets/tables/projectActivity';
import styles from './activityPanel.scss';

const cx = classNames.bind(styles);

const CONTENT_FIELDS = [
  'history',
  'loggedObjectRef',
  'projectRef',
  'objectType',
  'actionType',
  'lastModified',
  'user',
  'name',
];

const ACTION_TYPE = [
  'startLaunch',
  'finishLaunch',
  'deleteLaunch',
  'postIssue',
  'linkIssue',
  'unlinkIssue',
  'createUser',
  'createDashboard',
  'updateDashboard',
  'deleteDashboard',
  'createWidget',
  'updateWidget',
  'deleteWidget',
  'createFilter',
  'updateFilter',
  'deleteFilter',
  'createBts',
  'updateBts',
  'deleteBts',
  'updateProject',
  'updateAnalyzer',
  'generateIndex',
  'deleteIndex',
  'updateDefect',
  'deleteDefect',
  'startImport',
  'finishImport',
];

const WIDGET_TYPE = 'activityStream';

export const ActivityPanel = ({ data: { result } }) => {
  const widget = {
    content: { result: result.slice(0, 150) },
    contentFields: CONTENT_FIELDS,
    widgetOptions: {
      actionType: ACTION_TYPE,
    },
    share: false,
    widgetType: WIDGET_TYPE,
  };

  return (
    <div className={cx('activity-panel')}>
      <ProjectActivity widget={widget} />
    </div>
  );
};

ActivityPanel.propTypes = {
  data: PropTypes.object.isRequired,
};
