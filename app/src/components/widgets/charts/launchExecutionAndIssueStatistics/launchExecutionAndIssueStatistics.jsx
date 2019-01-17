import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { LaunchExecutionChart } from './launchExecutionChart';
import { IssueStatisticsChart } from './issueStatisticsChart';
import styles from './launchExecutionAndIssueStatistics.scss';

const cx = classNames.bind(styles);

@injectIntl
export class LaunchExecutionAndIssueStatistics extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
  };

  render() {
    return (
      <div className={cx('launch-execution-and-issues-chart')}>
        <LaunchExecutionChart
          widget={this.props.widget}
          container={this.props.container}
          observer={this.props.observer}
          isPreview={this.props.isPreview}
        />
        <IssueStatisticsChart
          widget={this.props.widget}
          container={this.props.container}
          observer={this.props.observer}
          isPreview={this.props.isPreview}
        />
      </div>
    );
  }
}
