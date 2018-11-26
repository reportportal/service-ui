import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { SharedMessage } from './sharedMessage';
import { FilterControls } from './filterControls';
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
};
FiltersActionBar.defaultProps = {
  filter: {},
  unsaved: false,
  discardDisabled: false,
  cloneDisabled: false,
  editDisabled: false,
  saveDisabled: false,
};
