/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { SharedMessage } from './sharedMessage';
import { FilterControls } from './filterControls';
import { FiltersSorting } from '../../filtersSorting';
import styles from './filtersActionBar.scss';

const cx = classNames.bind(styles);

export const FiltersActionBar = ({
  filter,
  unsaved,
  discardDisabled,
  cloneDisabled,
  editDisabled,
  saveDisabled,
  onDiscard,
  onClone,
  onEdit,
  onSave,
  onChangeSorting,
  sortingString,
}) => (
  <div className={cx('filters-action-bar')}>
    <div className={cx('info-section')}>
      {filter.share && (
        <div className={cx('shared')}>
          <SharedMessage />
        </div>
      )}
      {unsaved && (
        <div className={cx('unsaved-message')}>
          <span className={cx('asterisk')}>*</span>
          <FormattedMessage
            id="FiltersActionBar.unsavedFilter"
            defaultMessage="Filter is not saved"
          />
        </div>
      )}
    </div>
    <div className={cx('controls-section')}>
      <FiltersSorting filter={filter} sortingString={sortingString} onChange={onChangeSorting} />
      <FilterControls
        cloneDisabled={cloneDisabled}
        editDisabled={editDisabled}
        saveDisabled={saveDisabled}
        discardDisabled={discardDisabled}
        onChangeSorting={() => {}}
        onDiscard={onDiscard}
        onClone={onClone}
        onEdit={onEdit}
        onSave={onSave}
      />
    </div>
  </div>
);
FiltersActionBar.propTypes = {
  filter: PropTypes.object,
  unsaved: PropTypes.bool,
  discardDisabled: PropTypes.bool,
  cloneDisabled: PropTypes.bool,
  editDisabled: PropTypes.bool,
  saveDisabled: PropTypes.bool,
  onDiscard: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onChangeSorting: PropTypes.func.isRequired,
  sortingString: PropTypes.string.isRequired,
};
FiltersActionBar.defaultProps = {
  filter: {},
  unsaved: false,
  discardDisabled: false,
  cloneDisabled: false,
  editDisabled: false,
  saveDisabled: false,
};
