import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { getDefectTypeSelector } from 'controllers/project';
import styles from './defectTypeItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  getDefectType: getDefectTypeSelector(state),
}))
export class DefectTypeItem extends Component {
  static propTypes = {
    getDefectType: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    noBorder: PropTypes.bool,
    lesserFont: PropTypes.bool,
  };

  static defaultProps = {
    onClick: () => {},
    noBorder: false,
    lesserFont: false,
  };

  handleChange = () => {
    const { type, onClick } = this.props;
    onClick(type);
  };

  render() {
    const { noBorder, lesserFont, onClick } = this.props;
    const defectType = this.props.getDefectType(this.props.type);
    if (!defectType) {
      return null;
    }
    return (
      <div
        className={cx('defect-type-item', { 'no-border': noBorder, 'lesser-Font': lesserFont })}
        title={defectType.longName}
        onClick={onClick}
      >
        <div className={cx('defect-type-circle')} style={{ backgroundColor: defectType.color }} />
        <div className={cx('defect-type-name')}>{defectType.longName}</div>
      </div>
    );
  }
}
