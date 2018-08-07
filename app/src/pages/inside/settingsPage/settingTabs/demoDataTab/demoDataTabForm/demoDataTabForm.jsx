import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { validate } from 'common/utils';
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
      'Data generation is started. The process can take several minutes, please wait.',
  },
});

@reduxForm({
  form: 'demoDataTabForm',
  validate: ({ demoDataPostfix }) => ({
    demoDataPostfix:
      (!demoDataPostfix || !validate.demoDataPostfix(demoDataPostfix)) && 'demoDataPostfixHint',
  }),
})
@injectIntl
export class DemoDataTabForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  };

  render() {
    const { intl, handleSubmit, loading } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <div className={cx('input-wrapper')}>
          <FieldProvider name="demoDataPostfix" disabled={loading}>
            <FieldErrorHint>
              <Input placeholder={intl.formatMessage(messages.postfixInputPlaceholder)} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('generate-button')}>
          <BigButton mobileDisabled type="submit" disabled={loading}>
            <span className={cx('generate-button-title')}>
              {intl.formatMessage(messages.generateButtonTitle)}
            </span>
          </BigButton>
        </div>
        {loading && (
          <div className={cx('preloader-wrapper')}>
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
