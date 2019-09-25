import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import styles from './blockHeader.scss';

const cx = classNames.bind(styles);

export const BlockHeader = injectIntl(({ intl: { formatMessage }, header, hint }) => (
  <span className={cx('block-header')}>
    <span className={cx('huge-message')}>{formatMessage(header)}</span>
    <br />
    {formatMessage(hint)}
  </span>
));
BlockHeader.propTypes = {
  header: PropTypes.object,
  hint: PropTypes.object,
};
BlockHeader.defaultProps = {
  header: {},
  hint: {},
};
