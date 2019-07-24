import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import { isEmptyObject } from 'common/utils';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import styles from './lockedActiveFilter.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  filterNotFound: {
    id: 'FiltersControl.notFoundOnProject',
    defaultMessage: 'Filter is not found',
  },
});

@injectIntl
export class LockedActiveFilter extends PureComponent {
  static propTypes = {
    filter: PropTypes.object,
    onEdit: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    filter: {},
    onEdit: () => {},
  };

  render() {
    const { filter, onEdit, intl } = this.props;

    return (
      <div className={cx('locked-active-filter')}>
        <span className={cx('pencil-icon')} onClick={onEdit}>
          {Parser(PencilIcon)}
        </span>

        {isEmptyObject(filter) ? (
          <span className={cx('not-found')}>{intl.formatMessage(messages.filterNotFound)}</span>
        ) : (
          <Fragment>
            <FilterName
              userId={filter.owner}
              filter={filter}
              showDesc={false}
              editable={false}
              isBold
            />
            <FilterOptions entities={filter.conditions} sort={filter.orders} />
          </Fragment>
        )}
      </div>
    );
  }
}
