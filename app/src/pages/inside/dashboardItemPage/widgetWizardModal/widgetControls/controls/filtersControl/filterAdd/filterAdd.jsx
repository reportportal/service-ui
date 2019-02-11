import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { validate } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { messages } from '../common/messages';
import { FILTER_ADD_FORM, FILTER_NAME_KEY } from '../common/constants';
import { AddEditFilter } from '../common/addEditFilter';
import styles from './filterAdd.scss';

const cx = classNames.bind(styles);
const selector = formValueSelector(FILTER_ADD_FORM);

const localMessages = defineMessages({
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
  onChange: ({ name }, dispatcher, { onChange }) => onChange({ name }),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})
@connect((state) => ({
  name: selector(state, FILTER_NAME_KEY),
}))
@injectIntl
export class FilterAdd extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    filter: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    valid: PropTypes.bool.isRequired,
    name: PropTypes.string,
  };

  static defaultProps = {
    name: '',
    onSave: () => {},
    onCancel: () => {},
    onChange: () => {},
  };

  getCustomBlock = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('filter-add-custom-block')}>
        <span className={cx('custom-block-text')}>{formatMessage(localMessages.filterName)}</span>
        <FieldProvider name={FILTER_NAME_KEY}>
          <FieldErrorHint>
            <Input
              placeholder={formatMessage(localMessages.placeholderFilterName)}
              maxLength="128"
            />
          </FieldErrorHint>
        </FieldProvider>
      </div>
    );
  };

  handleFilterChange = (filter) =>
    this.props.onChange({
      ...filter,
      name: this.props.name,
    });

  render() {
    const { onCancel, filter, valid, onSave } = this.props;

    return (
      <AddEditFilter
        filter={filter}
        onCancel={onCancel}
        onSubmit={onSave}
        onChange={this.handleFilterChange}
        canSubmit={valid}
        blockTitle={messages.addTitle}
        customBlock={this.getCustomBlock()}
      />
    );
  }
}
