import React, { PureComponent } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import styles from './activeFilter.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  chooseFilter: {
    id: 'FiltersWrapper.chooseFilter',
    defaultMessage: 'Choose filter from the list below',
  },
});

@injectIntl
export class ActiveFilter extends PureComponent {
  static propTypes = {
    intl: intlShape,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
    filter: PropTypes.object,
  };

  static defaultProps = {
    intl: {},
    filter: false,
    touched: false,
    error: '',
  };

  render() {
    const { intl, error, filter, touched } = this.props;

    return (
      <div className={cx('filters-wrapper')}>
        <span className={cx('filters-text', { error: error && touched })}>
          {filter ? (
            <FilterName filter={filter} showDesc={false} />
          ) : (
            intl.formatMessage(messages.chooseFilter)
          )}
        </span>
      </div>
    );
  }
}
