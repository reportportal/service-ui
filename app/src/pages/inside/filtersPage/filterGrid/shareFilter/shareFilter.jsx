import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './shareFilter.scss';

const cx = classNames.bind(styles);

export const ShareFilter = ({ filter, userId, onEdit }) => (
  <Fragment>
    <div className={cx('mobile-label', 'shared-label')}>
      <FormattedMessage id={'ShareFilter.shared'} defaultMessage={'Shared:'} />
    </div>
    {filter.share ? (
      <div
        className={cx('shared-icon', { disabled: userId !== filter.owner })}
        onClick={userId === filter.owner ? () => onEdit(filter) : null}
      />
    ) : null}
  </Fragment>
);
ShareFilter.propTypes = {
  filter: PropTypes.object,
  userId: PropTypes.string,
  onEdit: PropTypes.func,
};
ShareFilter.defaultProps = {
  filter: {},
  userId: '',
  onEdit: () => {},
};
