import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import { breadcrumbsSelector } from 'controllers/testItem';
import styles from './logToolbar.scss';

const cx = classNames.bind(styles);

export const LogToolbar = connect((state) => ({
  breadcrumbs: breadcrumbsSelector(state),
}))(({ breadcrumbs, onRefresh }) => (
  <div className={cx('log-toolbar')}>
    <Breadcrumbs descriptors={breadcrumbs} />
    <div className={cx('action-buttons')}>
      <div className={cx('action-button')}>
        <div className={cx('left-arrow-button')}>
          <GhostButton icon={LeftArrowIcon} disabled />
        </div>
        <GhostButton icon={RightArrowIcon} disabled />
      </div>
      <div className={cx('action-button')}>
        <GhostButton icon={RefreshIcon} onClick={onRefresh}>
          <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
        </GhostButton>
      </div>
    </div>
  </div>
));
LogToolbar.propTypes = {
  breadcrumbs: PropTypes.array,
  onRefresh: PropTypes.func,
};
LogToolbar.defaultProps = {
  breadcrumbs: [],
  onRefresh: () => {},
};
