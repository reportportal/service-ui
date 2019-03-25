import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { BigButton } from 'components/buttons/bigButton';
import ArrowRightIcon from 'common/img/arrow-right-inline.svg';
import { analyticsEnabledSelector, fetchInfoAction, ANALYTICS_ALL_KEY } from 'controllers/appInfo';
import styles from './statisticsTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  statisticsInfo: {
    id: 'StatisticsTab.statisticsInfo',
    defaultMessage: `You can help us improve ReportPortal by opting to send usage statistics. While you're using the app, we'll gather data that might help us improve Report Portal performance and usability by tracking usage frequency of particular features. See below for details about what information is sent.`,
  },
  statisticsList: {
    id: 'StatisticsTab.statisticsList',
    defaultMessage: 'LIST OF SENT STATISTICS',
  },
  statisticsListMessage: {
    id: 'StatisticsTab.statisticsListMessage',
    defaultMessage: `Usage statistics reports usually won't include any personal information, but they might include:`,
  },
  statisticsListPoint1: {
    id: 'StatisticsTab.statisticsListPoint1',
    defaultMessage:
      'Device information - such as your hardware model, operating system version, screen resolution, browser version;',
  },
  statisticsListPoint2: {
    id: 'StatisticsTab.statisticsListPoint2',
    defaultMessage:
      'Log information - such as details of how you use ReportPortal, where you click and what actions you do, how long you leave app open.',
  },
  statisticsEnabled: {
    id: 'StatisticsTab.statisticsEnabled',
    defaultMessage: 'Help make Report Portal better by automatically sending statistics to us',
  },
  updateStatisticsEnabledSuccess: {
    id: 'StatisticsTab.updateStatisticsEnabledSuccess',
    defaultMessage: 'Server settings were successfully updated',
  },
});

@connect(
  (state) => ({
    statisticsEnabled: analyticsEnabledSelector(state),
  }),
  {
    showNotification,
    fetchInfo: fetchInfoAction,
  },
)
@injectIntl
export class StatisticsTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showNotification: PropTypes.func,
    fetchInfo: PropTypes.func,
    statisticsEnabled: PropTypes.bool,
  };

  static defaultProps = {
    change: () => {},
    showNotification: () => {},
    fetchInfo: () => {},
    statisticsEnabled: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.statisticsEnabled !== state.prevStatisticsEnabledValue) {
      return {
        statisticsEnabled: props.statisticsEnabled,
        prevStatisticsEnabledValue: state.statisticsEnabled,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      listShown: false,
      statisticsEnabled: props.statisticsEnabled,
      prevStatisticsEnabledValue: props.statisticsEnabled,
    };
  }

  onListClick = () => {
    this.setState((state) => ({
      listShown: !state.listShown,
    }));
  };

  submit = (data) => {
    this.setState({
      loading: true,
    });

    this.updateStatisticsConfig(data.enabled);
  };

  toggleStatistics = () => this.setState({ statisticsEnabled: !this.state.statisticsEnabled });

  updateStatisticsConfig = (statisticsEnabled) => {
    fetch(URLS.statisticsServerSettings(), {
      method: 'POST',
      data: {
        type: ANALYTICS_ALL_KEY,
        enabled: statisticsEnabled,
      },
    })
      .then(this.updateSettingSuccess)
      .catch(this.catchRequestError);
  };

  updateSettingSuccess = () => {
    const {
      intl: { formatMessage },
      fetchInfo,
    } = this.props;

    this.props.showNotification({
      message: formatMessage(messages.updateStatisticsEnabledSuccess),
      type: NOTIFICATION_TYPES.SUCCESS,
    });

    this.setState({
      loading: false,
    });
    fetchInfo();
  };

  catchRequestError = (error) => {
    this.setState({
      loading: false,
    });

    this.props.showNotification({
      message: error.message,
      type: NOTIFICATION_TYPES.ERROR,
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('statistics-settings-tab')}>
        <div className={cx('statistics-settings-form')}>
          <div className={cx('image-holder')} />
          <p className={cx('statistics-info')}>{formatMessage(messages.statisticsInfo)}</p>

          <div className={cx('statistics-list')}>
            <div className={cx('statistics-list-toggler')} onClick={this.onListClick}>
              <span>{formatMessage(messages.statisticsList)}</span>
              <span className={cx('arrow', { rotated: this.state.listShown })}>
                {Parser(ArrowRightIcon)}
              </span>
            </div>

            <div className={cx('list-message', { 'list-shown': this.state.listShown })}>
              <p>{formatMessage(messages.statisticsListMessage)}</p>
              <ul>
                <li className={cx('statistics-point')}>
                  {formatMessage(messages.statisticsListPoint1)}
                </li>
                <li className={cx('statistics-point')}>
                  {formatMessage(messages.statisticsListPoint2)}
                </li>
              </ul>
            </div>
          </div>

          {this.state.loading ? (
            <SpinningPreloader />
          ) : (
            <div className={cx('enabled-checkbox')}>
              <InputCheckbox
                className={cx('enabled-checkbox')}
                value={this.state.statisticsEnabled}
                onChange={this.toggleStatistics}
              >
                {formatMessage(messages.statisticsEnabled)}
              </InputCheckbox>
            </div>
          )}
          <BigButton
            className={cx('submit-button')}
            disabled={this.state.loading}
            onClick={this.submit}
            mobileDisabled
          >
            <span className={cx('submit-button-title')}>
              {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </span>
          </BigButton>
        </div>
        <div className={cx('mobile-disabling-cover')} />
      </div>
    );
  }
}
