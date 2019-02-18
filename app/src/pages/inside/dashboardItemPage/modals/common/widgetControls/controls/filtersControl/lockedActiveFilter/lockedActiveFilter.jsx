import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import styles from './lockedActiveFilter.scss';

const cx = classNames.bind(styles);

export class LockedActiveFilter extends PureComponent {
  static propTypes = {
    filter: PropTypes.object,
    onEdit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    filter: {},
    onEdit: () => {},
  };

  render() {
    const { filter, onEdit } = this.props;

    return (
      <div className={cx('locked-active-filter')}>
        <FilterName
          userId={filter.owner}
          filter={filter}
          showDesc={false}
          editable={false}
          isBold
        />
        <FilterOptions entities={filter.conditions} sort={filter.orders} />
        <span className={cx('pencil-icon')} onClick={onEdit}>
          {Parser(PencilIcon)}
        </span>
      </div>
    );
  }
}
