import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './shareFilter.scss';
import ShareIcon from './img/checkmark-icon-inline.svg';

const cx = classNames.bind(styles);

export const ShareFilter = ({ filter, userId, onEdit }) =>
  filter.share && (
    <Fragment>
      <div className={cx('mobile-label', 'shared-label')}>
        <FormattedMessage id={'ShareFilter.shared'} defaultMessage={'Shared:'} />
      </div>
      <div
        className={cx('shared-icon', { disabled: userId !== filter.owner })}
        onClick={userId === filter.owner ? () => onEdit(filter) : null}
      >
        {Parser(ShareIcon)}
      </div>
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
