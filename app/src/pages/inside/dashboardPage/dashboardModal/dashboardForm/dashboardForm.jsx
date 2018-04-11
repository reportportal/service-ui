import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { ModalField } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { Textarea } from 'components/inputs/textarea';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { validate } from 'common/utils';

import styles from './dashboardForm.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  dashboardNamePlaceholder: {
    id: 'DashboardForm.dashboardNamePlaceholder',
    defaultMessage: 'Enter Dashboard Name',
  },
  dashboardNameLabel: {
    id: 'DashboardForm.dashboardNameLabel',
    defaultMessage: 'Name',
  },
  dashboardDescriptionPlaceholder: {
    id: 'DashboardModal.dashboardDescriptionPlaceholder',
    defaultMessage: 'Enter Dashboard Description',
  },
  dashboardDescriptionLabel: {
    id: 'DashboardForm.dashboardDescriptionLabel',
    defaultMessage: 'Description',
  },
  dashboardShareLabel: {
    id: 'DashboardForm.dashboardShareLabel',
    defaultMessage: 'Share',
  },
});
@reduxForm({
  form: 'addEditDashboard',
  validate: ({ name }) => ({
    name: (!name || !validate.dashboardName(name)) && 'dashboardNameHint',
  }),
})
@injectIntl
export class DashboardForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initialize: PropTypes.func,
    dashboardItem: PropTypes.object,
  };

  static defaultProps = {
    initialize: () => {},
    dashboardItem: {
      name: '',
      description: '',
      share: false,
    },
  };

  componentDidMount() {
    this.props.initialize(this.props.dashboardItem);
  }

  render() {
    const { intl } = this.props;
    const labelWidth = '65px';

    return (
      <form className={cx('add-dashboard-form')}>
        <ModalField label={intl.formatMessage(messages.dashboardNameLabel)} labelWidth={labelWidth}>
          <FieldProvider name="name" type="text">
            <FieldErrorHint>
              <Input placeholder={intl.formatMessage(messages.dashboardNamePlaceholder)} />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
        <ModalField
          label={intl.formatMessage(messages.dashboardDescriptionLabel)}
          labelWidth={labelWidth}
        >
          <FieldProvider name="description" type="text">
            <Textarea
              placeholder={intl.formatMessage(messages.dashboardDescriptionPlaceholder)}
              defaultValue={this.props.dashboardItem.description}
              cols="42"
              rows="3"
            />
          </FieldProvider>
        </ModalField>
        <ModalField
          label={intl.formatMessage(messages.dashboardShareLabel)}
          labelWidth={labelWidth}
        >
          <FieldProvider name="share" format={Boolean} parse={Boolean}>
            <InputBigSwitcher />
          </FieldProvider>
        </ModalField>
      </form>
    );
  }
}
