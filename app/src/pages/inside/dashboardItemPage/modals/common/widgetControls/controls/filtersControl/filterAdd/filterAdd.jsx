import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { commonValidators, validateAsync } from 'common/utils';
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
    name: commonValidators.filterName(name),
  }),
  asyncValidate: ({ name }, dispatch, props) =>
    validateAsync.filterNameUnique(props.activeProject, undefined, name),
  asyncChangeFields: ['name'],
  asyncBlurFields: ['name'],
  onChange: ({ name }, dispatcher, { onChange }) => onChange({ name }),
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})
@track()
@connect((state) => ({
  name: selector(state, FILTER_NAME_KEY),
}))
@injectIntl
export class FilterAdd extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    filter: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    valid: PropTypes.bool.isRequired,
    name: PropTypes.string,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    name: '',
    onSave: () => {},
    onCancel: () => {},
    onChange: () => {},
    eventsInfo: {},
  };

  getCustomBlock = () => {
    const {
      intl: { formatMessage },
      tracking,
    } = this.props;

    return (
      <div className={cx('filter-add-custom-block')}>
        <span className={cx('custom-block-text')}>{formatMessage(localMessages.filterName)}</span>
        <FieldProvider
          name={FILTER_NAME_KEY}
          onChange={() => tracking.trackEvent(this.props.eventsInfo.editFilterName)}
        >
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

  handleFilterChange = (filter) => {
    this.props.onChange({
      ...filter,
      name: this.props.name,
    });
  };

  handlerFilterCancel = () => {
    this.props.tracking.trackEvent(this.props.eventsInfo.cancelAddNewFilter);
    this.props.onCancel();
  };

  handlerFilterSubmit = () => {
    this.props.tracking.trackEvent(this.props.eventsInfo.addNewFilter);
    this.props.onSave();
  };

  render() {
    const { filter, valid, eventsInfo } = this.props;

    return (
      <AddEditFilter
        filter={filter}
        onCancel={this.handlerFilterCancel}
        onSubmit={this.handlerFilterSubmit}
        onChange={this.handleFilterChange}
        isValid={valid}
        blockTitle={messages.addTitle}
        customBlock={this.getCustomBlock()}
        eventsInfo={eventsInfo}
      />
    );
  }
}
