import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { InvestigatedTrendChart } from 'components/widgets/charts/investigatedTrendChart';
import { NoItemMessage } from 'components/main/noItemMessage';
import { mapMinListLength } from 'components/widgets/charts/investigatedTrendChart/statusPageModeConfig';
import styles from './investigated.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataMessage: {
    id: 'LastLaunch.noDataMessage',
    defaultMessage: 'No launches were performed',
  },
});

@injectIntl
export class Investigated extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    interval: PropTypes.string,
  };

  static defaultProps = {
    interval: '3M',
  };

  state = {
    containerEl: null,
  };

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ containerEl: this.myRef.current });
  }

  myRef = React.createRef();

  prepareData = (rawData, interval) => {
    const minListLength = mapMinListLength[interval];
    const data = Object.keys(rawData).map((key) => rawData[key][0]);

    while (data.length < minListLength) {
      data.unshift({
        name: '',
        values: {
          investigated: 0,
          toInvestigate: 0,
        },
      });
    }

    return { content: data };
  };

  render() {
    const { data, interval, intl } = this.props;
    const { containerEl } = this.state;
    const isDataEmpty = !Object.keys(data).length;

    return (
      <div ref={this.myRef} className={cx('investigated')}>
        {containerEl && !isDataEmpty ? (
          <InvestigatedTrendChart
            widget={this.prepareData(data, interval)}
            interval={interval}
            container={containerEl}
            withoutBackground
            onStatusPageMode
          />
        ) : (
          <div className={cx('no-data-wrapper')}>
            <NoItemMessage message={intl.formatMessage(messages.noDataMessage)} />
          </div>
        )}
      </div>
    );
  }
}
