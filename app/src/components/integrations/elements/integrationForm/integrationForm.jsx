import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import { INTEGRATION_FORM } from './constants';
import styles from './integrationForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  configureTitle: {
    id: 'IntegrationForm.configureTitle',
    defaultMessage: 'Configure',
  },
  configurationTitle: {
    id: 'SauceLabsSettings.configuration',
    defaultMessage: 'Configuration',
  },
});

@reduxForm({
  form: INTEGRATION_FORM,
})
@injectIntl
export class IntegrationForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    formFieldsComponent: PropTypes.func.isRequired,
  };

  state = {
    disabled: true,
  };

  toggleDisabled = () => this.setState({ disabled: !this.state.disabled });

  submitIntegration = (formData) => {
    this.props.onSubmit(formData, this.toggleDisabled);
  };

  render() {
    const {
      intl: { formatMessage },
      data: { blocked, integrationParameters = {} },
      handleSubmit,
      dirty,
      initialize,
      change,
      formFieldsComponent: FieldsComponent,
    } = this.props;
    const { disabled } = this.state;

    return (
      <form className={cx('integration-form')}>
        <h3 className={cx('block-header')}>{formatMessage(messages.configurationTitle)}</h3>
        <div className={cx('integration-form-fields')}>
          <FieldsComponent
            initialize={initialize}
            change={change}
            initialData={integrationParameters}
            disabled={disabled}
          />
        </div>
        {!blocked && (
          <div className={cx('controls-block')}>
            {disabled ? (
              <GhostButton onClick={this.toggleDisabled} mobileDisabled>
                {formatMessage(messages.configureTitle)}
              </GhostButton>
            ) : (
              <div className={cx('control-buttons-block')}>
                <div className={cx('button-container')}>
                  <BigButton color={'gray-60'} onClick={this.toggleDisabled}>
                    {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
                  </BigButton>
                </div>
                <div className={cx('button-container')}>
                  <BigButton
                    onClick={dirty ? handleSubmit(this.submitIntegration) : this.toggleDisabled}
                  >
                    {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
                  </BigButton>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    );
  }
}
