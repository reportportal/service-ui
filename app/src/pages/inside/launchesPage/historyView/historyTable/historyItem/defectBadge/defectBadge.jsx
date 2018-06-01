import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { DefectTypeTooltip } from 'pages/inside/launchesPage/defectTypeTooltip';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './defectBadge.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: DefectTypeTooltip,
  data: {
    width: 235,
    align: 'right',
    noArrow: true,
    desktopOnly: true,
  },
})
export class DefectBadge extends Component {
  static propTypes = {
    defectTitle: PropTypes.string,
    type: PropTypes.string,
    data: PropTypes.object,
  };

  static defaultProps = {
    defectTitle: '',
    type: '',
    data: {},
  };

  render() {
    const { defectTitle, type } = this.props;

    return (
      <div type={type} className={cx('defect-badge', defectTitle)}>
        <span>{defectTitle}</span>
      </div>
    );
  }
}
