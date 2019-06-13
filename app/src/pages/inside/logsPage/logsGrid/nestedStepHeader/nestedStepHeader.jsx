import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import ArrowIcon from 'common/img/arrow-right-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import classNames from 'classnames/bind';
import styles from './nestedStepHeader.scss';

const cx = classNames.bind(styles);

const StatusLabel = ({ status }) => (
  <div className={cx('status-container')}>
    <div className={cx('indicator', status.toLowerCase())} />
    <div className={cx('status')}>{status}</div>
  </div>
);

StatusLabel.propTypes = {
  status: PropTypes.string,
};

StatusLabel.defaultProps = {
  status: '',
};

export class NestedStepHeader extends Component {
  static propTypes = {
    data: PropTypes.object,
    collapsed: PropTypes.bool,
    onExpand: PropTypes.func,
    onToggle: PropTypes.func,
    level: PropTypes.number,
  };

  static defaultProps = {
    data: {},
    collapsed: false,
    onExpand: () => {},
    onToggle: () => {},
    level: 0,
  };

  onToggle = () => {
    const { data, collapsed, onExpand, onToggle } = this.props;
    if (collapsed) {
      onExpand(data);
    }
    onToggle();
  };

  render() {
    const { data, collapsed, level } = this.props;
    return (
      <div className={cx('header-container')}>
        <div className={cx('separator')} />
        <div
          className={cx('row', {
            [`level-${level}`]: level !== 0,
          })}
        >
          <div
            className={cx('first-col-wrapper', {
              [`level-${level}`]: level !== 0,
            })}
          >
            <div className={cx('step-name')} onClick={this.onToggle}>
              <div className={cx('arrow-icon', { expanded: !collapsed })}>{Parser(ArrowIcon)}</div>
              <div>{data.name}</div>
            </div>
          </div>
          <div className={cx('row-cell')}>
            <StatusLabel status={data.status} />
          </div>
          <div className={cx('row-cell')}>
            <div className={cx('statistics')}>
              <div className={cx('attachments')}>
                <div className={cx('attachment-icon')}>{Parser(AttachmentIcon)}</div>
                <div className={cx('attachment-count')}>{data.attachmentCount}</div>
              </div>
              <div>
                <DurationBlock
                  type={data.type}
                  status={data.status}
                  itemNumber={data.number}
                  timing={{
                    start: data.startTime,
                    end: data.endTime,
                    approxTime: data.approximateDuration,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={cx('separator')} />
      </div>
    );
  }
}
