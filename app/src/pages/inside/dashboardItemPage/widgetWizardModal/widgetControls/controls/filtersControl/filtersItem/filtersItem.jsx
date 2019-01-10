import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { InputRadio } from 'components/inputs/inputRadio';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import styles from './filtersItem.scss';

const cx = classNames.bind(styles);

export class FiltersItem extends PureComponent {
  static propTypes = {
    search: PropTypes.string,
    userId: PropTypes.string,
    activeFilterIds: PropTypes.string,
    filter: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    editable: PropTypes.bool,
  };

  static defaultProps = {
    search: '',
    userId: '',
    activeFilterIds: '',
    item: {},
    onChange: () => {},
    onEdit: () => {},
    editable: false,
  };

  render() {
    const { activeFilterIds, filter, search, onChange, onEdit, userId, editable } = this.props;

    return (
      <div className={cx('filter-item')}>
        <InputRadio
          value={activeFilterIds}
          ownValue={String(filter.id)}
          name={'filter-id'}
          onChange={onChange}
          circleAtTop
        >
          <FilterName
            search={search}
            filter={filter}
            userId={userId}
            showDesc={false}
            editable={editable}
          />
          <FilterOptions entities={filter.conditions} sort={filter.orders}>
            {userId === filter.owner &&
              editable && (
                <span className={cx('pencil-icon')} onClick={onEdit}>
                  {Parser(PencilIcon)}
                </span>
              )}
          </FilterOptions>
        </InputRadio>
      </div>
    );
  }
}
