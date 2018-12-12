import React from 'react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import styles from './filterAddInput.scss';

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

export const FilterAddInput = injectIntl(({ intl }) => (
  <div className={cx('filter-add-input')}>
    <span className={cx('filter-add-input-text')}>{intl.formatMessage(messages.filterName)}</span>
    <FieldProvider name={'name'}>
      <FieldErrorHint>
        <Input placeholder={intl.formatMessage(messages.placeholderFilterName)} maxLength="128" />
      </FieldErrorHint>
    </FieldProvider>
  </div>
));

FilterAddInput.propTypes = {
  intl: intlShape.isRequired,
};
