import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { ToggleButton } from 'components/buttons/toggleButton';
import { StatusPageContent } from './statusPageContent';
import { PERIOD_VALUES } from './constants';
import styles from './projectStatusPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  sixMonths: {
    id: 'ProjectStatusPage.sixMonths',
    defaultMessage: '6 months',
  },
  threeMonths: {
    id: 'ProjectStatusPage.threeMonths',
    defaultMessage: '3 months',
  },
  oneMonth: {
    id: 'ProjectStatusPage.oneMonth',
    defaultMessage: '1 month',
  },
});

@injectIntl
export class ProjectStatusPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  state = {
    selectedPeriod: PERIOD_VALUES.threeMonths,
  };

  onPeriodChange = (selectedPeriod) => this.setState({ selectedPeriod });

  periods = [
    { value: PERIOD_VALUES.sixMonths, label: this.props.intl.formatMessage(messages.sixMonths) },
    {
      value: PERIOD_VALUES.threeMonths,
      label: this.props.intl.formatMessage(messages.threeMonths),
    },
    { value: PERIOD_VALUES.oneMonth, label: this.props.intl.formatMessage(messages.oneMonth) },
  ];

  render() {
    return (
      <div className={cx('project-status-page')}>
        <div className={cx('toggle-container')}>
          <ToggleButton
            items={this.periods}
            value={this.state.selectedPeriod}
            separated
            onChange={this.onPeriodChange}
          />
        </div>
        <StatusPageContent interval={this.state.selectedPeriod} projectId={this.props.projectId} />
      </div>
    );
  }
}
