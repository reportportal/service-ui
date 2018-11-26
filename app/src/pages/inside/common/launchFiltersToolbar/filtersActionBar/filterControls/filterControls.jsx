import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import CloneIcon from 'common/img/clone-inline.svg';
import DiscardIcon from 'common/img/discard-inline.svg';
import SaveIcon from 'common/img/save-inline.svg';
import styles from './filterControls.scss';

const cx = classNames.bind(styles);

export const FilterControls = injectIntl(
  ({
    intl,
    discardDisabled,
    cloneDisabled,
    editDisabled,
    saveDisabled,
    onDiscard,
    onClone,
    onEdit,
    onSave,
  }) => (
    <div className={cx('filter-controls')}>
      <div className={cx('control-button')}>
        <GhostButton
          icon={DiscardIcon}
          title={intl.formatMessage(COMMON_LOCALE_KEYS.DISCARD)}
          disabled={discardDisabled}
          onClick={onDiscard}
        >
          {intl.formatMessage(COMMON_LOCALE_KEYS.DISCARD)}
        </GhostButton>
      </div>
      <div className={cx('control-button')}>
        <GhostButton
          icon={CloneIcon}
          title={intl.formatMessage(COMMON_LOCALE_KEYS.CLONE)}
          disabled={cloneDisabled}
          onClick={onClone}
        >
          {intl.formatMessage(COMMON_LOCALE_KEYS.CLONE)}
        </GhostButton>
      </div>
      <div className={cx('control-button')}>
        <GhostButton
          icon={PencilIcon}
          title={intl.formatMessage(COMMON_LOCALE_KEYS.EDIT)}
          disabled={editDisabled}
          onClick={onEdit}
        >
          {intl.formatMessage(COMMON_LOCALE_KEYS.EDIT)}
        </GhostButton>
      </div>
      <div className={cx('control-button')}>
        <GhostButton
          icon={SaveIcon}
          title={intl.formatMessage(COMMON_LOCALE_KEYS.SAVE)}
          disabled={saveDisabled}
          onClick={onSave}
        >
          {intl.formatMessage(COMMON_LOCALE_KEYS.SAVE)}
        </GhostButton>
      </div>
    </div>
  ),
);
FilterControls.propTypes = {
  discardDisabled: PropTypes.bool,
  cloneDisabled: PropTypes.bool,
  editDisabled: PropTypes.bool,
  saveDisabled: PropTypes.bool,
  onChangeSorting: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
FilterControls.defaultProps = {
  discardDisabled: false,
  cloneDisabled: false,
  editDisabled: false,
  saveDisabled: false,
};
