import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetch, validate } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { Input } from 'components/inputs/input';
import { BigButton } from 'components/buttons/bigButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import styles from './demoDataTabForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  postfixInputPlaceholder: {
    id: 'DemoDataTabForm.postfixInputPlaceholder',
    defaultMessage: 'Enter postfix',
  },
  generateButtonTitle: {
    id: 'DemoDataTabForm.generateButtonTitle',
    defaultMessage: 'Generate demo data',
  },
  preloaderInfo: {
    id: 'DemoDataTabForm.preloaderInfo',
    defaultMessage:
      'Data generation has started. The process can take several minutes, please wait.',
  },
  generateDemoDataSuccess: {
    id: 'SuccessMessages.generateDemoDataSuccess',
    defaultMessage: 'Demo data has been generated',
  },
});

@reduxForm({
  form: 'demoDataTabForm',
  validate: ({ demoDataPostfix }) => ({
    demoDataPostfix:
      (!demoDataPostfix || !validate.demoDataPostfix(demoDataPostfix)) && 'demoDataPostfixHint',
  }),
})
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
export class DemoDataTabForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
  };

  state = {
    isLoading: false,
  };

  onFormSubmit = (formData) => {
    const { intl, projectId, reset } = this.props;
    const data = {
      isCreateDashboard: 'true',
      postfix: formData.demoDataPostfix,
    };

    this.setState({
      isLoading: true,
    });
    fetch(URLS.generateDemoData(projectId), { method: 'POST', data })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.generateDemoDataSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.setState({
          isLoading: false,
        });
        reset('demoDataTabForm');
      })
      .catch((e) => {
        this.props.showNotification({
          messageId: 'failureDefault',
          type: NOTIFICATION_TYPES.ERROR,
          values: { error: e.message },
        });
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const { intl, handleSubmit } = this.props;

    return (
      <form className={cx('demo-data-form')} onSubmit={handleSubmit(this.onFormSubmit)}>
        <div className={cx('postfix-input')}>
          <FieldProvider name="demoDataPostfix" disabled={this.state.isLoading}>
            <FieldErrorHint>
              <Input placeholder={intl.formatMessage(messages.postfixInputPlaceholder)} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <BigButton
          className={cx('generate-button')}
          mobileDisabled
          type="submit"
          disabled={this.state.isLoading}
        >
          <span className={cx('generate-button-title')}>
            {intl.formatMessage(messages.generateButtonTitle)}
          </span>
        </BigButton>
        {this.state.isLoading && (
          <div className={cx('preloader-block')}>
            <div className={cx('preloader-icon')}>
              <SpinningPreloader />
            </div>
            <div className={cx('preloader-info')}>{intl.formatMessage(messages.preloaderInfo)}</div>
          </div>
        )}
      </form>
    );
  }
}
