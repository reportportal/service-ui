import React from 'react';
import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { formatDuration } from 'common/utils';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import Parser from 'html-react-parser';
import ClockIcon from 'common/img/clock-icon-inline.svg';
import { MessageBlock } from './messageBlock';
import styles from './itemsListRow.scss';

const cx = classNames.bind(styles);

const StepDuration = ({ duration }) => (
  <div className={cx('duration-block')}>
    <div className={cx('icon')}>{Parser(ClockIcon)}</div>
    <span className={cx('time')}>{formatDuration(duration * 1000, true)}</span>
  </div>
);

StepDuration.propTypes = {
  duration: PropTypes.number,
};

StepDuration.defaultProps = {
  duration: 0,
};

export class ItemsListRow extends React.Component {
  static propTypes = {
    onToggleItemSelect: PropTypes.func,
    selected: PropTypes.bool,
    testItem: PropTypes.object,
  };

  static defaultProps = {
    onToggleItemSelect: () => {},
    selected: false,
    testItem: {},
  };

  toggleSelect = () => {
    this.props.onToggleItemSelect(this.props.testItem, !this.props.selected);
  };

  render() {
    const { selected, testItem } = this.props;
    return (
      <div className={cx('row')}>
        <div className={cx('selection-column')}>
          <InputCheckbox value={selected} onChange={this.toggleSelect} />
        </div>
        <div className={cx('info-column')}>
          <div className={cx('item-header')}>
            <div className={cx('item-name')} title={testItem.itemName}>
              {testItem.itemName}
            </div>
            <div className={cx('item-detail')}>
              <div className={cx('duration')}>
                <StepDuration duration={testItem.duration} />
              </div>
              <div className={cx('status')}>
                <TestItemStatus status={testItem.status} />
              </div>
              <div className={cx('issueType')}>
                <DefectTypeItem type={testItem.issue.issueType} />
              </div>
            </div>
          </div>
          <MessageBlock message={testItem.logMessages} />
        </div>
      </div>
    );
  }
}
