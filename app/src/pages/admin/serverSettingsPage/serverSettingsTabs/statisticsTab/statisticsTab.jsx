import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FieldProvider } from 'components/fields/fieldProvider';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { BigButton } from 'components/buttons/bigButton';
import ArrowRightIcon from 'common/img/arrow-right-inline.svg';
import { STATISTICS_ENABLED_KEY, STATISTICS_TYPE, DEFAULT_FORM_CONFIG } from './constants';
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

@reduxForm({
  form: 'statisticsTabForm',
  initialValues: DEFAULT_FORM_CONFIG,
})
@connect(null, {
  showNotification,
})
@injectIntl
export class StatisticsTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
    showNotification: PropTypes.func,
  };

  static defaultProps = {
    initialize: () => {},
    handleSubmit: () => {},
    change: () => {},
    showNotification: () => {},
  };

  state = {
    loading: true,
    listShown: false,
  };

  componentDidMount() {
    this.fetchEmailConfig();
  }

  onFormSubmit = (data) => {
    this.setState({
      loading: true,
    });

    this.updateEmailConfig({
      method: 'POST',
      data: {
        type: STATISTICS_TYPE,
        enabled: data.enabled,
      },
    });
  };

  onListClick = () => {
    this.setState((state) => ({
      listShown: !state.listShown,
    }));
  };

  updateEmailConfig = (options) => {
    fetch(URLS.statisticsServerSettings(), options)
      .then(() => this.updateSettingSuccess())
      .catch(this.catchRequestError);
  };

  fetchEmailConfig = () => {
    fetch(URLS.serverSettings())
      .then((data) => {
        const analyticsResource = data.analyticsResource && data.analyticsResource[STATISTICS_TYPE];
        const config = {
          [STATISTICS_ENABLED_KEY]: !!(analyticsResource && analyticsResource.enabled),
        };

        this.props.initialize(config);
        this.setState({
          loading: false,
        });
      })
      .catch(this.catchRequestError);
  };

  updateSettingSuccess = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showNotification({
      message: formatMessage(messages.updateStatisticsEnabledSuccess),
      type: NOTIFICATION_TYPES.SUCCESS,
    });

    this.setState({
      loading: false,
    });
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
      handleSubmit,
    } = this.props;

    return (
      <div className={cx('statistics-settings-tab')}>
        <form className={cx('statistics-settings-form')} onSubmit={handleSubmit(this.onFormSubmit)}>
          <div className={cx('image-holder')} />
          <p className={cx('statistics-info')}>{formatMessage(messages.statisticsInfo)}</p>

          <div className={cx('statistics-list', { 'list-shown': this.state.listShown })}>
            <div className={cx('statistics-list-toggler')} onClick={this.onListClick}>
              <span>{formatMessage(messages.statisticsList)}</span>
              <span className={cx('arrow')}>{Parser(ArrowRightIcon)}</span>
            </div>

            <div className={cx('list-message')}>
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
              <FieldProvider name={STATISTICS_ENABLED_KEY} format={Boolean}>
                <InputCheckbox className={cx('enabled-checkbox')}>
                  {formatMessage(messages.statisticsEnabled)}
                </InputCheckbox>
              </FieldProvider>
            </div>
          )}
          <BigButton
            className={cx('submit-button')}
            disabled={this.state.loading}
            type="submit"
            mobileDisabled
          >
            <span className={cx('submit-button-title')}>
              {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </span>
          </BigButton>
        </form>
        <div className={cx('mobile-disabling-cover')} />
      </div>
    );
  }
}
