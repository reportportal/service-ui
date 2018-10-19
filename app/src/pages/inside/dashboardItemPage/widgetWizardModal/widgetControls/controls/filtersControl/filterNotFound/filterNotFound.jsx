import React from 'react';
import { defineMessages, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ErrorIcon from 'common/img/error-inline.svg';

import styles from './filterNotFound.scss';

const messages = defineMessages({
  filtersNotFound: {
    id: 'FiltersNotFound.notFound',
    defaultMessage: `No filters found for "{filter}".`,
  },
  checkQuery: {
    id: 'FiltersNotFound.checkQuery',
    defaultMessage: `Check your query and try again`,
  },
});
const cx = classNames.bind(styles);

export const FilterNotFound = ({ searchValue, intl }) => {
  const filter = `<span>${searchValue}</span>`;

  return (
    <div className={cx('filter-not-found')}>
      <p className={cx('filter-not-found-text')}>
        <i className={cx('filter-not-found-icon')}>{Parser(ErrorIcon)}</i>
        {Parser(intl.formatMessage(messages.filtersNotFound, { filter }))}
      </p>
      <p className={cx('filter-not-found-hint')}>{intl.formatMessage(messages.checkQuery)}</p>
    </div>
  );
};

FilterNotFound.propTypes = {
  intl: intlShape.isRequired,
  searchValue: PropTypes.string.isRequired,
};

FilterNotFound.defaultProps = {
  intl: {},
  searchValue: '',
};
