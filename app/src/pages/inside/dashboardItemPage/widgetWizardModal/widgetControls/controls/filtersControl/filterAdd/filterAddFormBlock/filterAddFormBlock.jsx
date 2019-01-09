import React, { Component } from 'react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { reduxForm } from 'redux-form';
import { validate } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { FILTER_ADD_FORM, FILTER_NAME_KEY } from '../../common/constants';
import styles from './filterAddFormBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  filterName: {
    id: 'AddFilter.filterName',
    defaultMessage: 'Filter Name',
  },
  placeholderFilterName: {
    id: 'AddFilter.placeholderFilterName',
    defaultMessage: 'Input filter name',
  },
});

@reduxForm({
  form: FILTER_ADD_FORM,
  validate: ({ name }) => ({
    name: (!name || !validate.filterName(name)) && 'filterNameError',
  }),
  onChange: (fields, dispatcher, { onChange }) => onChange(),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})
@injectIntl
export class FilterAddFormBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <div className={cx('filter-add-form-block')}>
        <span className={cx('form-block-text')}>{formatMessage(messages.filterName)}</span>
        <FieldProvider name={FILTER_NAME_KEY}>
          <FieldErrorHint>
            <Input placeholder={formatMessage(messages.placeholderFilterName)} maxLength="128" />
          </FieldErrorHint>
        </FieldProvider>
      </div>
    );
  }
}
