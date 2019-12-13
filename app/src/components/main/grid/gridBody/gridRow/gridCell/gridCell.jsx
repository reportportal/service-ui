/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PureComponent } from 'react';
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

export class GridCell extends PureComponent {
  static propTypes = {
    ...columnPropTypes,
    component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    value: PropTypes.object,
    refFunction: PropTypes.func,
    expanded: PropTypes.bool,
    toggleExpand: PropTypes.func,
  };

  static defaultProps = {
    component: TextCell,
    value: {},
    align: ALIGN_LEFT,
    formatter: (value) => value,
    title: {},
    refFunction: () => {},
    expanded: false,
    toggleExpand: () => {},
  };

  render() {
    const {
      id,
      component,
      refFunction,
      value,
      align,
      formatter,
      title,
      customProps,
      expanded,
      toggleExpand,
    } = this.props;
    const CellComponent = component;
    return (
      <CellComponent
        className={cx('grid-cell', { [`align-${align}`]: align })}
        refFunction={refFunction}
        title={title}
        value={formatter(value)}
        id={id}
        customProps={customProps}
        expanded={expanded}
        toggleExpand={toggleExpand}
      />
    );
  }
}
