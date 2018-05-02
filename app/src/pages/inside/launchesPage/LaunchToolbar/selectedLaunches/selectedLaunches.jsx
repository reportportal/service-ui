import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/icon-cross-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SelectedLaunch } from './selectedLaunch';
import styles from './selectedLaunches.scss';

const cx = classNames.bind(styles);

export const SelectedLaunches = ({ selectedLaunches, errors, onClose, onUnselect }) => (
  <div className={cx('selected-launches')}>
    <div className={cx('header')}>
      <FormattedMessage
        id="LaunchesPage.multipleSelectHeader"
        defaultMessage="You can perform actions with selected items:"
      />
      <div className={cx('close-icon')} onClick={onClose}>
        {Parser(CrossIcon)}
      </div>
    </div>
    <ScrollWrapper autoHeight autoHeightMax={120} hideTracksWhenNotNeeded>
      <div className={cx('list')}>
        {selectedLaunches.map((launch) => (
          <div className={cx('launch')} key={launch.id}>
            <SelectedLaunch
              name={launch.name}
              number={launch.number}
              error={errors[launch.id]}
              onUnselect={() => onUnselect(launch)}
            />
          </div>
        ))}
      </div>
    </ScrollWrapper>
    {selectedLaunches.some((launch) => !!errors[launch.id]) && (
      <div className={cx('error-message')}>
        <FormattedMessage
          id="LaunchesPage.multiSelectError"
          defaultMessage="You cannot perform operation to invalid items"
        />
      </div>
    )}
  </div>
);
SelectedLaunches.propTypes = {
  selectedLaunches: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
  onUnselect: PropTypes.func,
  errors: PropTypes.object,
};
SelectedLaunches.defaultProps = {
  selectedLaunches: [],
  errors: {},
  onClose: () => {},
  onUnselect: () => {},
};
