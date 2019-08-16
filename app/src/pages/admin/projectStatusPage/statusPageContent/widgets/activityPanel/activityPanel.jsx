import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ProjectActivity } from 'components/widgets/singleLevelWidgets/tables/projectActivity';
import styles from './activityPanel.scss';

const cx = classNames.bind(styles);

export const ActivityPanel = ({ data: { result } }) => {
  const widget = {
    content: { result: result.slice(0, 150) },
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
