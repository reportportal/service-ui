import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from 'components/main/grid/propTypes';
import { ALIGN_LEFT } from 'components/main/grid/constants';
import styles from './gridCell.scss';

const cx = classNames.bind(styles);

const TextCell = ({ className, value }) => (
  <div className={cx(className, 'text-cell')}>
    <span>{value}</span>
  </div>
);
TextCell.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
};
TextCell.defaultProps = {
  className: '',
  value: '',
};

export const GridCell = ({
  component,
  refFunction,
  value,
  align,
  formatter,
  title,
  customProps,
}) => {
  const CellComponent = component;
  return (
    <CellComponent
      className={cx('grid-cell', { [`align-${align}`]: align })}
      refFunction={refFunction}
      title={title}
      value={formatter(value)}
      customProps={customProps}
    />
  );
};
GridCell.propTypes = {
  ...columnPropTypes,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  value: PropTypes.object,
  refFunction: PropTypes.func,
};
GridCell.defaultProps = {
  component: TextCell,
  value: {},
  align: ALIGN_LEFT,
  formatter: value => value,
  title: {},
  refFunction: () => {
  },
};
