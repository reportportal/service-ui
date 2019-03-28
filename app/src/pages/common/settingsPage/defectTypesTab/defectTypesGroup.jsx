import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { defectTypeShape } from './defectTypeShape';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

const ColorMarker = ({ color }) => (
  <span className={cx('color-marker')} style={{ backgroundColor: color }} />
);

ColorMarker.propTypes = {
  color: PropTypes.string.isRequired,
};

export class DefectTypesGroup extends Component {
  static propTypes = {
    group: PropTypes.arrayOf(defectTypeShape).isRequired,
  };

  render() {
    const { group } = this.props;

    return group.map(({ id, longName, shortName, color }) => (
      <div key={id} className={cx('defect-type')}>
        <div className={cx('name-cell')}>
          <span className={cx('defect-type-name-wrap')}>
            <ColorMarker color={color} />
            <span className={cx('defect-type-name')}>{longName}</span>
          </span>
        </div>
        <div className={cx('abbr-cell')}>{shortName}</div>
        <div className={cx('color-cell')}>
          <ColorMarker color={color} />
        </div>
      </div>
    ));
  }
}
