import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import styles from './componentHealthCheckColorScheme.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  minPassingRateValueMessage: {
    id: 'ComponentHealthCheckChartColorScheme.minPassingRateValueMessage',
    defaultMessage: 'less than {value}%',
  },
  maxPassingRateValueMessage: {
    id: 'ComponentHealthCheckChartColorScheme.maxPassingRateValueMessage',
    defaultMessage: '{value} - 100%',
  },
});

const MAX_PASSING_RATE_VALUE = 100;

@injectIntl
export class ComponentHealthCheckColorScheme extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    passingRate: PropTypes.number,
  };

  static defaultProps = {
    passingRate: null,
  };

  render() {
    const { intl, passingRate } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('item')}>
          <div className={cx('scheme-wrap', 'scheme-wrap--failed')} />
          <span className={cx('scheme-message')}>
            {intl.formatMessage(messages.minPassingRateValueMessage, { value: passingRate - 1 })}
          </span>
        </div>
        <div className={cx('item')}>
          <div
            className={cx('scheme-wrap', 'scheme-wrap--passed', {
              'scheme-wrap--passed-max': passingRate === MAX_PASSING_RATE_VALUE,
            })}
          />
          <span className={cx('scheme-message')}>
            {passingRate === MAX_PASSING_RATE_VALUE
              ? '100%'
              : intl.formatMessage(messages.maxPassingRateValueMessage, { value: passingRate })}
          </span>
        </div>
      </div>
    );
  }
}
