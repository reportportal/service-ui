import React, { PureComponent } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';

import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { InputRadio } from 'components/inputs/inputRadio';
import { FilterOptions } from 'pages/inside/filtersPage/filterGrid/filterOptions';
import { FilterName } from 'pages/inside/filtersPage/filterGrid/filterName';
import styles from './filtersItem.scss';

const cx = classNames.bind(styles);

@injectIntl
export class FiltersItem extends PureComponent {
  static propTypes = {
    intl: intlShape,
    userId: PropTypes.string,
    activeFilterId: PropTypes.string,
    filter: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    intl: {},
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
          <FilterName filter={filter} showDesc={false} />
          <FilterOptions entities={filter.entities} sort={filter.selection_parameters.orders}>
            {userId === filter.owner && (
              <span className={cx('pencil-icon')} onClick={() => {}}>
                {Parser(PencilIcon)}
              </span>
            )}
          </FilterOptions>
        </InputRadio>
      </div>
    );
  }
}
