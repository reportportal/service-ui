import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import className from 'classnames/bind';
import { reduxForm } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { ModalField } from 'components/main/modal';
import { labelWidth } from './constants';
import { FormRow } from './formRow/index';
import styles from './forms.scss';
import { emailToggleMessages } from './messages';

const cx = className.bind(styles);

@injectIntl
@reduxForm({
  form: 'toggleEmailNotification',
  onChange: (values, dispatch, props) => {
    props.submit();
  },
})
export class EmailToggle extends Component {
  static propTypes = {
    initialize: PropTypes.func,
    emailEnabled: PropTypes.object,
    intl: intlShape.isRequired,
    readOnly: PropTypes.bool,
  };
  static defaultProps = {
    initialize: () => {},
    emailEnabled: {},
    readOnly: true,
  };
  render() {
    const { intl } = this.props;
    return (
      <FormRow
        note={() => (
          <div className={cx('note-checkbox')}>
            {intl.formatMessage(emailToggleMessages.toggleNotificationsNote)}
          </div>
        )}
      >
        <ModalField
          label={intl.formatMessage(emailToggleMessages.toggleNotificationsLabel)}
          labelWidth={labelWidth}
        >
          <FieldProvider name="emailEnabled" format={Boolean} parse={Boolean}>
            <InputBigSwitcher disabled={this.props.readOnly} />
          </FieldProvider>
        </ModalField>
      </FormRow>
    );
  }
}
