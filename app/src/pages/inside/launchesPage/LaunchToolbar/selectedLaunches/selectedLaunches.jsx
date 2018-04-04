import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/icon-cross-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SelectedLaunch } from './selectedLaunch';
import styles from './selectedLaunches.scss';

const cx = classNames.bind(styles);

export const SelectedLaunches = ({ selectedLaunches, onClose, onUnselect }) => (
  <div className={cx('selected-launches')}>
    <div className={cx('header')}>
      YOU CAN PERFORM ACTIONS WITH SELECTED ITEMS:
      <div className={cx('close-icon')} onClick={onClose}>
        {Parser(CrossIcon)}
      </div>
    </div>
    <ScrollWrapper autoHeight autoHeightMax={120} hideTracksWhenNotNeeded>
      <div className={cx('list')}>
        {selectedLaunches.map((launch) => (
          <SelectedLaunch
            className={cx('launch')}
            key={launch.id}
            name={launch.name}
            onUnselect={() => onUnselect(launch)}
          />
        ))}
      </div>
    </ScrollWrapper>
  </div>
);
SelectedLaunches.propTypes = {
  selectedLaunches: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
  onUnselect: PropTypes.func,
};
SelectedLaunches.defaultProps = {
  selectedLaunches: [],
  onClose: () => {},
  onUnselect: () => {},
};
