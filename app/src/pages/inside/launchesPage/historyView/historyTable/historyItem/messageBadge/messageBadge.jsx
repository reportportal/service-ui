import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { withTooltip } from 'components/main/tooltips/tooltip';
import Parser from 'html-react-parser';
import styles from './messageBadge.scss';

const cx = classNames.bind(styles);

const BadgeInfoToolTip = ({ data }) => (
  <div className={cx('tooltip-content')}>
    {data.map((item) => (
      <div key={item.ticketId.length}>
        <span>{item.ticketId}</span>
        <br />
      </div>
    ))}
  </div>
);
BadgeInfoToolTip.propTypes = {
  data: PropTypes.object,
};
BadgeInfoToolTip.defaultProps = {
  data: {},
};

@withTooltip({
  TooltipComponent: BadgeInfoToolTip,
  data: {
    width: 235,
    align: 'right',
    noArrow: true,
    desktopOnly: true,
  },
})
export class MessageBadge extends Component {
  static propTypes = {
    data: PropTypes.array,
    type: PropTypes.string,
    icon: PropTypes.string,
    iconClass: PropTypes.string,
  };

  static defaultProps = {
    data: [],
    type: '',
    icon: '',
    iconClass: '',
  };

  render() {
    const { iconClass, icon } = this.props;

    return (
      <div>
        <i className={cx('icon', `${iconClass}`)}>{Parser(icon)}</i>
      </div>
    );
  }
}
