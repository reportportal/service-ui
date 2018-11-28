import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import * as COLORS from 'common/constants/colors';
import styles from './legend.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  statistics$executions$total: {
    id: 'FilterNameById.statistics$executions$total',
    defaultMessage: 'Total',
  },
  statistics$executions$passed: {
    id: 'FilterNameById.statistics$executions$passed',
    defaultMessage: 'Passed',
  },
  statistics$executions$failed: {
    id: 'FilterNameById.statistics$executions$failed',
    defaultMessage: 'Failed',
  },
  statistics$executions$failedSkippedTotal: {
    id: 'FilterNameById.statistics$executions$failedSkippedTotal',
    defaultMessage: '% (Failed+Skipped)/Total',
  },
  statistics$executions$skipped: {
    id: 'FilterNameById.statistics$executions$skipped',
    defaultMessage: 'Skipped',
  },
  statistics$defects$product_bug: {
    id: 'FilterNameById.statistics$defects$product_bug',
    defaultMessage: 'Product bug',
  },
  statistics$defects$automation_bug: {
    id: 'FilterNameById.statistics$defects$automation_bug',
    defaultMessage: 'Automation bug',
  },
  statistics$defects$system_issue: {
    id: 'FilterNameById.statistics$defects$system_issue',
    defaultMessage: 'System issue',
  },
  statistics$defects$no_defect: {
    id: 'FilterNameById.statistics$defects$no_defect',
    defaultMessage: 'No defect',
  },
  statistics$defects$to_investigate: {
    id: 'FilterNameById.statistics$defects$to_investigate',
    defaultMessage: 'To investigate',
  },
  ofTestCases: {
    id: 'Widgets.ofTestCases',
    defaultMessage: 'of test cases',
  },
  Passed: {
    id: 'Passed',
    defaultMessage: 'Passed',
  },
  Failed: {
    id: 'Failed',
    defaultMessage: 'Failed',
  },
  LaunchName: {
    id: 'LaunchName',
    defaultMessage: 'LAUNCH NAME:',
  },
});

@injectIntl
export class Legend extends Component {
  static propTypes = {
    isPreview: PropTypes.bool,
    intl: intlShape.isRequired,
    items: PropTypes.array,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    widgetName: PropTypes.string,
  };

  static defaultProps = {
    isPreview: false,
    items: [],
    onClick: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
    widgetName: '',
  };

  onClick = (e) => {
    const target = this.getTarget(e);
    target.classList.toggle(cx('unchecked'));
    this.props.onClick(target.getAttribute('data-id'));
  };

  onMouseOver = (e) => {
    const target = this.getTarget(e);
    this.props.onMouseOver(target.getAttribute('data-id'));
  };

  getTarget = ({ target }) => (target.getAttribute('data-id') ? target : target.parentElement);

  render() {
    const { items, intl, onMouseOut, isPreview, widgetName } = this.props;
    if (isPreview) return '';

    const elements = items.map((name) => (
      <span
        key={name}
        data-id={name}
        className={cx('legend-item')}
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={onMouseOut}
      >
        <span
          className={cx('color-mark')}
          style={{ backgroundColor: COLORS[`COLOR_${name.toUpperCase()}_PER_LAUNCH`] }}
        />
        <span className={cx('item-name')}>{intl.formatMessage(messages[name])}</span>
      </span>
    ));

    return (
      <div className={cx('top-block')}>
        <div className={cx('info-data')}>
          {intl.formatMessage(messages.LaunchName)} <span>{widgetName}</span>
        </div>
        <div className={cx('legend')}>{elements}</div>
      </div>
    );
  }
}
