import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
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
  dashboardDescriptionPlaceholder: {
    id: 'DashboardModal.dashboardDescriptionPlaceholder',
    defaultMessage: 'Enter Dashboard Description',
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
    dashboardItem: {},
  };

  componentDidMount() {
    this.props.initialize(this.props.dashboardItem);
  }

  render() {
    const { intl } = this.props;
    return (
      <form className={cx('add-dashboard-form')}>
        <label className={cx('form-field')}>
          <span className={cx('form-label')}>Name</span>
          <div className={cx('input-wrap', 'text-input')}>
            <FieldProvider name="name" type="text">
              <FieldErrorHint>
                <Input placeholder={intl.formatMessage(messages.dashboardNamePlaceholder)} />
              </FieldErrorHint>
            </FieldProvider>
          </div>
        </label>
        <label className={cx('form-field')}>
          <span className={cx('form-label')}>Description</span>
          <div className={cx('input-wrap', 'textarea-input')}>
            <FieldProvider name="description" type="text">
              <Textarea
                placeholder={intl.formatMessage(messages.dashboardDescriptionPlaceholder)}
                defaultValue={this.props.dashboardItem.description}
              />
            </FieldProvider>
          </div>
        </label>
        <label className={cx('form-field')}>
          <span className={cx('form-label')}>Share</span>
          <div className={cx('input-wrap')}>
            <FieldProvider name="share" type="text">
              <InputBigSwitcher />
            </FieldProvider>
          </div>
        </label>
      </form>
    );
  }
}
