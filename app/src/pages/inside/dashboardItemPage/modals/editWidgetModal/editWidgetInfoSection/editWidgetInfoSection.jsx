import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { WidgetInfoBlock } from '../../common/widgetInfoBlock';
import styles from './editWidgetInfoSection.scss';

const cx = classNames.bind(styles);

export const EditWidgetInfoSection = ({ projectId, widgetSettings, activeWidget }) => (
  <div className={cx('edit-widget-info-section')}>
    <WidgetInfoBlock
      projectId={projectId}
      activeWidget={activeWidget}
      widgetSettings={widgetSettings}
    />
  </div>
);

EditWidgetInfoSection.propTypes = {
  projectId: PropTypes.string.isRequired,
  widgetSettings: PropTypes.object,
  activeWidget: PropTypes.object,
};

EditWidgetInfoSection.defaultProps = {
  widgetSettings: {},
  activeWidget: {},
};
