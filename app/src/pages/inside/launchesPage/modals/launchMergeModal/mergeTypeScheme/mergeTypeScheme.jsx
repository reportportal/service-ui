import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './mergeTypeScheme.scss';

const cx = classNames.bind(styles);

export const MergeTypeScheme = ({ type }) => (
  <div className={cx('merge-type-scheme', [type.toLowerCase()])} />
);

MergeTypeScheme.propTypes = {
  type: PropTypes.string,
};
MergeTypeScheme.defaultProps = {
  type: '',
};
