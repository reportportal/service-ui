import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper/index';
import { SelectedItem } from './selectedItem/index';
import styles from './selectedItems.scss';

const cx = classNames.bind(styles);

export const SelectedItems = ({ selectedItems, errors, onClose, onUnselect }) => (
  <div className={cx('selected-items')}>
    <div className={cx('header')}>
      <FormattedMessage id="LaunchesPage.multipleSelectHeader" defaultMessage="Selected items:" />
      <div className={cx('close-icon')} onClick={onClose}>
        {Parser(CrossIcon)}
      </div>
    </div>
    <ScrollWrapper autoHeight autoHeightMax={120} hideTracksWhenNotNeeded>
      <div className={cx('list')}>
        {selectedItems.map((item) => (
          <div className={cx('item')} key={item.id}>
            <SelectedItem
              name={item.name}
              number={item.number}
              error={errors[item.id]}
              onUnselect={() => onUnselect(item)}
            />
          </div>
        ))}
      </div>
    </ScrollWrapper>
    {selectedItems.some((item) => !!errors[item.id]) && (
      <div className={cx('error-message')}>
        <FormattedMessage
          id="LaunchesPage.multiSelectError"
          defaultMessage="You cannot perform operation to invalid items"
        />
      </div>
    )}
  </div>
);
SelectedItems.propTypes = {
  selectedItems: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
  onUnselect: PropTypes.func,
  errors: PropTypes.object,
};
SelectedItems.defaultProps = {
  selectedItems: [],
  errors: {},
  onClose: () => {},
  onUnselect: () => {},
};
