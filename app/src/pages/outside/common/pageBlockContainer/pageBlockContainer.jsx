import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { BlockHeader } from './blockHeader';
import styles from './pageBlockContainer.scss';

const cx = classNames.bind(styles);

export const PageBlockContainer = ({ header, hint, children }) => (
  <div className={cx('page-block-container')}>
    <BlockHeader header={header} hint={hint} />
    {children}
  </div>
);
PageBlockContainer.propTypes = {
  header: PropTypes.object,
  hint: PropTypes.object,
  children: PropTypes.node,
};
PageBlockContainer.defaultProps = {
  header: {},
  hint: {},
  children: null,
};
