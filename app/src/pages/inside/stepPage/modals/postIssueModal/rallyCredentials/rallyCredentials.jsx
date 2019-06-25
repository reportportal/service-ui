import React, { Component } from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputTextArea } from 'components/inputs/inputTextArea';
import styles from './rallyCredentials.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  apiKeyLabel: {
    id: 'RallyCredentials.apiKeyLabel',
    defaultMessage: 'ApiKey',
  },
});

@injectIntl
export class RallyCredentials extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.props;
    return (
      <div className={cx('rally-credentials')}>
        <FormField
          name="token"
          containerClassName={cx('text-area-container')}
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.apiKeyLabel)}
          labelClassName={cx('text-area-label')}
          required
          type="text"
        >
          <FieldErrorHint>
            <InputTextArea />
          </FieldErrorHint>
        </FormField>
      </div>
    );
  }
}
