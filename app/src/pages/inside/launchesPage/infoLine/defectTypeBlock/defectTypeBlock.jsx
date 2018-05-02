import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { projectConfigSelector } from 'controllers/project';
import { DefectTypeTooltip } from 'pages/inside/launchesPage/defectTypeTooltip';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import styles from './defectTypeBlock.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: DefectTypeTooltip,
  data: {
    width: 235,
    align: 'right',
    noArrow: true,
    desktopOnly: true,
  },
})
@connect(state => ({
  projectConfig: projectConfigSelector(state),
}))
export class DefectTypeBlock extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    projectConfig: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
  };

  render() {
    const defectType = this.props.projectConfig.subTypes[this.props.type.toUpperCase()][0];
    return (
      <div className={cx('defect-type-block')}>
        <div className={cx('circle')} style={{ backgroundColor: defectType.color }} />
        <span className={cx('title')}>
          { defectType.shortName }
        </span>
        <div className={cx('value')} style={{ borderColor: defectType.color }}>
          {this.props.data.total}
        </div>
      </div>
    );
  }
}
