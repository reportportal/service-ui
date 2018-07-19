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
  };

  static defaultProps = {
    onEdit: () => {},
  };

  getDefectType = () => {
    const { projectConfig, type } = this.props;
    return Object.keys(projectConfig.subTypes).reduce(
      (defectType, subType) =>
        projectConfig.subTypes[subType].find((issueType) => issueType.locator === type) ||
        defectType,
    );
  };

  render() {
    const defectType = this.getDefectType();
    return (
      <div
        className={cx('defect-type-item')}
        title={defectType.longName}
        onClick={this.props.onEdit}
      >
        <div className={cx('defect-type-circle')} style={{ backgroundColor: defectType.color }} />
        <div className={cx('defect-type-name')}>{defectType.longName}</div>
      </div>
    );
  }
}
