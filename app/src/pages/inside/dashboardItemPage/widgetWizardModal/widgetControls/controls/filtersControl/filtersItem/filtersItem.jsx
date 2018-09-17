import React, { PureComponent } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { InputRadio } from 'components/inputs/inputRadio';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import styles from './filtersItem.scss';

const cx = classNames.bind(styles);

@injectIntl
export class FiltersItem extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    activeFilterId: PropTypes.string,
    filter: PropTypes.object.isRequired,
    userId: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    userId: '',
    activeFilterId: '',
    item: {},
    onChange: () => {},
  };

  render() {
    const { activeFilterId, filter, onChange, userId } = this.props;

    return (
      <div className={cx('filter-item')}>
        <InputRadio
          value={activeFilterId}
          ownValue={filter.id}
          name={'filter-item'}
          onChange={onChange}
          circleAtTop
        >
          <FilterName filter={filter} userId={userId}/>
          <FilterOptions entities={filter.entities} sort={filter.selection_parameters.orders}/>
        </InputRadio>
      </div>
    );
  }
}
