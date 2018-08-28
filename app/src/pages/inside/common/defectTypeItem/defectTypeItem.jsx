import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { projectConfigSelector } from 'controllers/project';
import styles from './defectTypeItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectConfig: projectConfigSelector(state),
}))
export class DefectTypeItem extends Component {
  static propTypes = {
    projectConfig: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    noBorder: PropTypes.bool,
    lessFont: PropTypes.bool,
  };

  static defaultProps = {
    onClick: () => {},
    noBorder: false,
    lessFont: false,
  };

  getDefectType = () => {
    const { projectConfig, type } = this.props;
    return Object.keys(projectConfig.subTypes).reduce(
      (defectType, subType) =>
        projectConfig.subTypes[subType].find((issueType) => issueType.locator === type) ||
        defectType,
      null,
    );
  };

  handleChange = () => {
    const { type, onClick } = this.props;
    onClick(type);
  };

  render() {
    const { noBorder, lessFont, onClick } = this.props;
    const defectType = this.getDefectType();
    if (!defectType) {
      return null;
    }
    return (
      <div
        className={cx('defect-type-item', { 'no-border': noBorder, 'less-font': lessFont })}
        title={defectType.longName}
        onClick={onClick}
      >
        <div className={cx('defect-type-circle')} style={{ backgroundColor: defectType.color }} />
        <div className={cx('defect-type-name')}>{defectType.longName}</div>
      </div>
    );
  }
}
