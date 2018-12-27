import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FormField } from 'components/fields/formField';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { BigButton } from 'components/buttons/bigButton';
import WarningIcon from 'common/img/error-inline.svg';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { SectionHeader } from 'components/main/sectionHeader';
import { messages, ENABLED_KEY } from '../constants';
import styles from './formController.scss';

const cx = classNames.bind(styles);

@connect(null, {
  showNotification,
})
@injectIntl
export class FormController extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
    prepareDataBeforeSubmit: PropTypes.func,
    prepareDataBeforeInitialize: PropTypes.func,
    showNotification: PropTypes.func,
    successMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    formOptions: PropTypes.shape({
      switcherLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      FieldsComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
      initialConfigUrl: PropTypes.string.isRequired,
      getSubmitUrl: PropTypes.func.isRequired,
      formHeader: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      customProps: PropTypes.object,
      withErrorBlock: PropTypes.bool,
      defaultFormConfig: PropTypes.object,
    }),
  };

  static defaultProps = {
    enabled: false,
    prepareDataBeforeSubmit: (data) => data,
    prepareDataBeforeInitialize: (data) => data,
    showNotification: () => {},
    successMessage: '',
    formOptions: {
      formHeader: '',
      customProps: {},
      withErrorBlock: false,
      defaultFormConfig: {},
    },
  };

  state = {
    loading: true,
    errorMessage: '',
  };

  componentDidMount() {
    this.fetchInitialConfig();
  }

  onFormSubmit = (formData) => {
    this.setState({
      loading: true,
      errorMessage: '',
    });
    const data = this.props.prepareDataBeforeSubmit(formData);
    const requestOptions = {
      method: this.props.enabled ? 'POST' : 'DELETE',
    };
    if (this.props.enabled) {
      requestOptions.data = data;
    }
    return this.updateConfig(requestOptions, formData.id);
  };

  updateConfig = (options, id) =>
    fetch(this.props.formOptions.getSubmitUrl(id), options)
      .then(() => this.updateConfigSuccess(options.method))
      .catch(this.catchRequestError);

  fetchInitialConfig = () =>
    fetch(this.props.formOptions.initialConfigUrl)
      .then((data) => {
        const {
          prepareDataBeforeInitialize,
          initialize,
          formOptions: { defaultFormConfig },
        } = this.props;
        const initialData = prepareDataBeforeInitialize(data);
        initialize({
          ...defaultFormConfig,
          ...initialData,
        });
        this.stopLoading();
      })
      .catch(this.stopLoading);

  updateConfigSuccess = (method) => {
    const {
      intl: { formatMessage },
      formOptions: { defaultFormConfig },
      successMessage,
    } = this.props;
    if (method === 'DELETE') {
      this.props.initialize(defaultFormConfig);
    }
    this.props.showNotification({
      message: formatMessage(successMessage),
      type: NOTIFICATION_TYPES.SUCCESS,
    });
    this.stopLoading();
  };

  catchRequestError = (error) => {
    this.setState({
      loading: false,
      errorMessage: this.props.formOptions.withErrorBlock && error.message,
    });
  };

  stopLoading = () =>
    this.setState({
      loading: false,
    });

  render() {
    const {
      intl: { formatMessage },
      formOptions: { FieldsComponent, customProps, withErrorBlock, switcherLabel, formHeader },
      handleSubmit,
      enabled,
    } = this.props;

    return (
      <div className={cx('form-controller')}>
        {formHeader && (
          <div className={cx('heading-wrapper')}>
            <SectionHeader text={formHeader} />
          </div>
        )}
        <form className={cx('form')} onSubmit={handleSubmit(this.onFormSubmit)}>
          {this.state.loading ? (
            <SpinningPreloader />
          ) : (
            <FormField
              name={ENABLED_KEY}
              label={formatMessage(switcherLabel)}
              labelClassName={cx('label')}
              format={Boolean}
              parse={Boolean}
            >
              <InputBigSwitcher mobileDisabled />
            </FormField>
          )}
          {enabled && <FieldsComponent {...customProps} />}
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
          {withErrorBlock &&
            this.state.errorMessage && (
              <div className={cx('error-message-block')}>
                <strong className={cx('warning-wrapper')}>
                  <div className={cx('warning-icon')}>{Parser(WarningIcon)}</div>
                  <span className={cx('warning-message')}>
                    {formatMessage(messages.warningMessage)}
                  </span>
                </strong>
                <div className={cx('error-message')}>{this.state.errorMessage}</div>
              </div>
            )}
        </form>
      </div>
    );
  }
}
