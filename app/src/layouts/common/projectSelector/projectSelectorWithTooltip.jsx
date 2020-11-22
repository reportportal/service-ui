import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { ProjectSelector } from 'layouts/common/projectSelector/projectSelector';
import styles from './projectSelectorTooltip.scss';

const cx = classNames.bind(styles);

const Tooltip = ({ activeProject }) => (
  <div className={cx('project-selector-tooltip')}>{activeProject}</div>
);
Tooltip.propTypes = {
  activeProject: PropTypes.string.isRequired,
};

export const ProjectSelectorWithTooltip = withTooltip({
  TooltipComponent: Tooltip,
  data: {
    dynamicWidth: true,
    placement: 'right',
    tooltipTriggerClass: cx('tooltip-trigger'),
    dark: true,
  },
})(ProjectSelector);
