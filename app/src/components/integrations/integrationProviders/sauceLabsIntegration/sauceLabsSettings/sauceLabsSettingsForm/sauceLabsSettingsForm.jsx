import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { BigButton } from 'components/buttons/bigButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SauceLabsFormFields } from '../../sauceLabsFormFields';
import styles from './sauceLabsSettingsForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  configureTitle: {
    id: 'SauceLabsSettingsForm.configureTitle',
    defaultMessage: 'Configure',
  },
});

@reduxForm({
  form: 'sauceLabsSettingsForm',
})
@injectIntl
export class SauceLabsSettingsForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  state = {
    disabled: true,
  };

  componentDidMount() {
    const {
      initialize,
      data: { integrationParameters = {} },
    } = this.props;
    initialize(integrationParameters);
  }

  toggleDisabled = () => this.setState({ disabled: !this.state.disabled });

  submitIntegration = (formData) => {
    this.props.onSubmit(formData, this.toggleDisabled);
  };

  render() {
    const {
      intl: { formatMessage },
      data: { blocked },
      handleSubmit,
    } = this.props;
    const { disabled } = this.state;

    return (
      <div className={cx('sauce-labs-settings-form')}>
        <SauceLabsFormFields disabled={disabled} />
        <div className={cx('controls-block')}>
          {!blocked &&
            (disabled ? (
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
                  <BigButton onClick={handleSubmit(this.submitIntegration)}>
                    {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
                  </BigButton>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
}
