import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './historyCell.scss';

const cx = classNames.bind(styles);

export const HistoryCell = ({ status, header, children, onClick, first }) => {
  const prefix = header ? 'header' : 'body';
  const className = cx('table-cell', `table-${prefix}-cell`, {
    [`table-${prefix}-cell-${status}`]: status,
    [`table-${prefix}-cell-first`]: first,
  });
  return header ? (
    <th className={className} onClick={onClick}>
      {children}
    </th>
  ) : (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <td className={className} onClick={onClick}>
      {children}
    </td>
  );
};

HistoryCell.propTypes = {
  status: PropTypes.string,
  header: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  onClick: PropTypes.func,
  first: PropTypes.bool,
};

HistoryCell.defaultProps = {
  status: null,
  header: false,
  children: null,
  onClick: () => {},
  first: false,
};
