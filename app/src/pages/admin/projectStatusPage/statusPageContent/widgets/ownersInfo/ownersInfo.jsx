import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './ownersInfo.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noDataMessage: {
    id: 'OwnersInfo.noDataMessage',
    defaultMessage: 'No launches were performed at the selected period',
  },
});

export const OwnersInfo = injectIntl(
  ({ intl: { formatMessage }, data: { launchesPerUser = [] } }) => (
    <div className={cx('owners-info')}>
      <ScrollWrapper autoHeight autoHeightMax={180} hideTracksWhenNotNeeded>
        {launchesPerUser.length ? (
          launchesPerUser.map((item) => (
            <div key={item.fullName} className={cx('info-row')}>
              <span className={cx('info-item')}>{item.fullName}</span>
              <span className={cx('info-item')}>{item.count}</span>
            </div>
          ))
        ) : (
          <div className={cx('no-data-wrapper')}>
            <NoItemMessage message={formatMessage(messages.noDataMessage)} />
          </div>
        )}
      </ScrollWrapper>
    </div>
  ),
);

OwnersInfo.propTypes = {
  data: PropTypes.object.isRequired,
};
