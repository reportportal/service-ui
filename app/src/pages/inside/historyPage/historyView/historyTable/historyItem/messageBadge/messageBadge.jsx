import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { withTooltip } from 'components/main/tooltips/tooltip';
import Parser from 'html-react-parser';
import styles from './messageBadge.scss';

const cx = classNames.bind(styles);

const MessageBadgeToolTip = ({ data }) => (
  <div className={cx('tooltip-content')}>
    {data.map((item) => (
      <div className={cx('content-container')} key={item.ticketId}>
        <span>{item.ticketId}</span>
      </div>
    ))}
  </div>
);
MessageBadgeToolTip.propTypes = {
  data: PropTypes.array,
};
MessageBadgeToolTip.defaultProps = {
  data: [],
};

@withTooltip({
  TooltipComponent: MessageBadgeToolTip,
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
    icon: PropTypes.string,
  };

  static defaultProps = {
    data: [],
    icon: '',
  };

  render() {
    const { icon } = this.props;

    return <i className={cx('icon')}>{Parser(icon)}</i>;
  }
}
