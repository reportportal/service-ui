import { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tooltip.scss';

const cx = classNames.bind(styles);

export class Tooltip extends Component {
  static propTypes = {
    launchName: PropTypes.string,
    launchNumber: PropTypes.string,
    startTime: PropTypes.string,
    itemCases: PropTypes.number,
    itemName: PropTypes.string,
    color: PropTypes.string.isRequired,
  };

  static defaultProps = {
    launchName: '',
    launchNumber: '',
    startTime: '',
    itemCases: 0,
    itemName: '',
  };

  dateFormat = (val) => {
    const date = new Date(+val);
    const month = this.normalize(date.getMonth() + 1);
    const day = this.normalize(date.getDate());
    const hour = this.normalize(date.getHours());
    const minute = this.normalize(date.getMinutes());
    const second = this.normalize(date.getSeconds());
    const fullYear = date.getFullYear();

    return `${fullYear}-${month}-${day} ${hour}:${minute}:${second}`;
  };

  normalize = (input) => (String(input).length < 2 ? `0${input}` : input);

  render() {
    const { launchName, launchNumber, startTime, itemCases, color, itemName } = this.props;
    return (
      <div className={cx('tooltip')}>
        <div className={cx('launch-name')}>{`${launchName} #${launchNumber}`}</div>
        <div className={cx('launch-start-time')}>{this.dateFormat(startTime)}</div>
        <div className={cx('item-wrapper')}>
          <span className={cx('color-mark')} style={{ backgroundColor: color }} />
          <span className={cx('item-name')}>{`${itemName}:`}</span>
          <span className={cx('item-cases')}>
            <span>{`${itemCases}%`}</span>
          </span>
        </div>
      </div>
    );
  }
}

function renderToHtml(component) {
  const el = document.createElement('div');
  render(component, el);
  return el.innerHTML;
}

export const renderTooltip = (data) => renderToHtml(<Tooltip {...data} />);
