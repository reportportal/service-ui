import React, { PureComponent } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './filtersWrapper.scss';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';

const cx = classNames.bind(styles);
const messages = defineMessages({
  chooseFilter: {
    id: 'FiltersPage.chooseFilter',
    defaultMessage: 'Choose filter from the list below',
  },
});

@injectIntl
export class FiltersWrapper extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
    filter: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  };

  static defaultProps = {
    filter: false,
    touched: false,
    error: '',
  };

  render() {
    const { intl, error, filter, touched } = this.props;

    return (
      <div className={cx('filters-wrapper')}>
        <span className={cx('filters-text', { error: error && touched })}>
          {filter ? <FilterName filter={filter} /> : intl.formatMessage(messages.chooseFilter)}
        </span>
      </div>
    );
  }
}
