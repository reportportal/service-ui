import {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {columnPropTypes} from '../../propTypes';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT } from '../../constants';
import styles from './gridCell.scss';

const cx = classNames.bind(styles);

// const TextCell = ({ className, value, selectors, width }) => (
//   <div className={cx(className, 'text-cell')}>
//     <div className={cx('text-cell', 'desktop')} style={{width}}>
//       <span>{value[selectors[0]]}</span>
//     </div>
//     <div className={cx('text-cell', 'mobile')}>
//       <span>{value[selectors[0]]}</span>
//     </div>
//   </div>
// );
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

// export class GridCell extends Component {
//   state = {
//     width: null,
//   };
//
//   componentDidMount() {
//     this.match = window.matchMedia('(max-width: 991px)');
//     this.match.addListener(this.updateWidth);
//     this.updateWidth(this.match);
//   }
//
//   componentWillUnmount() {
//     if (this.match) {
//       this.match.removeListener(this.updateWidth);
//     }
//   }
//
//   updateWidth = (media) => this.setState({width: media.matches ? this.props.mobileWidth : this.props.width});
//
//   render() {
//     const { selectors, component, item, align } = this.props;
//     const formatter = this.props.formatter || (v => v);
//     const CellComponent = component;
//     // return (
//     //   <div className={cx('grid-cell', { [`align-${align}`]: align })} style={{ width: this.state.width }}>
//     //     <CellComponent value={item} selectors={selectors} />
//     //   </div>
//     // );
//     return (
//       <CellComponent className={cx('grid-cell', { [`align-${align}`]: align })} value={formatter(item)} selectors={selectors} width={this.state.width} />
//     );
//   }
// }

export const GridCell = ({ component, value, align, formatter, title }) => {
  const CellComponent = component;
  return (
    <CellComponent
      className={cx('grid-cell', { [`align-${align}`]: align })}
      title={title}
      value={formatter(value)}
    />
  );
  // return (
  //   <div className={cx('grid-cell', { [`align-${align}`]: align })} style={{ width }}>
  //     <CellComponent value={item} selectors={selectors} />
  //   </div>
  // );
};
GridCell.propTypes = {
  ...columnPropTypes,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  value: PropTypes.object,
};
GridCell.defaultProps = {
  component: TextCell,
  value: {},
  align: ALIGN_LEFT,
  formatter: value => value,
  title: '',
};
