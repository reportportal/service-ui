import React, { Component } from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { DEFAULT_RALLY_CONFIG } from '../constants';
import styles from './rallyCredentials.scss';

const cx = classNames.bind(styles);

const authTypes = [{ value: DEFAULT_RALLY_CONFIG.systemAuth, label: 'ApiKey' }];

const messages = defineMessages({
  authTypeLabel: {
    id: 'RallyCredentials.authTypeLabel',
    defaultMessage: 'Authorization type',
  },
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
          name="systemAuth"
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.authTypeLabel)}
          labelClassName={cx('field-title')}
        >
          <FieldErrorHint>
            <InputDropdown options={authTypes} />
          </FieldErrorHint>
        </FormField>
        <FormField
          name="accessKey"
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
