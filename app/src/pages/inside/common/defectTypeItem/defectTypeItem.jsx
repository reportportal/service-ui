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
    onEdit: PropTypes.func,
    onChange: PropTypes.func,
    selectMode: PropTypes.bool,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    onEdit: () => {},
    onChange: () => {},
    selectMode: false,
    selected: false,
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
    const { type, onChange } = this.props;
    onChange(type);
  };

  render() {
    const { selectMode, selected, onEdit } = this.props;
    const defectType = this.getDefectType();
    if (!defectType) {
      return null;
    }
    return (
      <div
        className={cx('defect-type-item', { 'select-mode': selectMode, selected })}
        title={defectType.longName}
        onClick={selectMode ? this.handleChange : onEdit}
      >
        <div className={cx('defect-type-circle')} style={{ backgroundColor: defectType.color }} />
        <div className={cx('defect-type-name')}>{defectType.longName}</div>
      </div>
    );
  }
}
