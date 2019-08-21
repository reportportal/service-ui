import React from 'react';
import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { formatDuration } from 'common/utils';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import { PatternAnalyzedLabel } from 'pages/inside/common/patternAnalyzedLabel';
import Parser from 'html-react-parser';
import ClockIcon from 'common/img/clock-icon-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import { getLogItemLinkSelector } from 'controllers/testItem';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
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

const ItemPathTooltipIcon = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    noArrow: false,
    width: 600,
  },
})(() => <div className={cx('path', 'icon')}>{Parser(InfoIcon)}</div>);

@connect((state) => ({
  getLogItemLink: getLogItemLinkSelector(state),
}))
export class ItemsListRow extends React.Component {
  static propTypes = {
    onToggleItemSelect: PropTypes.func,
    getLogItemLink: PropTypes.func,
    selected: PropTypes.bool,
    testItem: PropTypes.object,
  };

  static defaultProps = {
    onToggleItemSelect: () => {},
    getLogItemLink: () => {},
    selected: false,
    testItem: {},
  };

  getLogItemTooltip = () => {
    const { testItem } = this.props;
    const testItemPath = testItem.path.split('.').slice(0, -1);
    return testItemPath.reduce(
      (path, itemId, index) =>
        `${path} \n<b>Parent ${index + 1}:</b> ${testItem.pathNames[itemId]}`,
      `<b>Launch:</b> ${testItem.launchName}`,
    );
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
            <div className={cx('item-name')}>
              <ItemPathTooltipIcon tooltipContent={this.getLogItemTooltip()} />
              <Link
                to={this.props.getLogItemLink(testItem)}
                className={cx('item-link')}
                target="_blank"
                title={testItem.itemName}
              >
                {testItem.itemName}
              </Link>
            </div>
            <div className={cx('item-detail')}>
              <div className={cx('duration')}>
                <StepDuration duration={testItem.duration} />
              </div>
              <div className={cx('status')}>
                <TestItemStatus status={testItem.status} />
              </div>
              {!!testItem.patternTemplates.length && (
                <div className={cx('pa-label')}>
                  <PatternAnalyzedLabel patternTemplates={testItem.patternTemplates} />
                </div>
              )}
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
