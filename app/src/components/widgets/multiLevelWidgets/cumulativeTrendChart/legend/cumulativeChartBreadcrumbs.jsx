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
import Parser from 'html-react-parser';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import styles from './cumulativeChartBreadcrumbs.scss';

const cx = classNames.bind(styles);

export class CumulativeChartBreadcrumbs extends PureComponent {
  static propTypes = {
    attributes: PropTypes.array,
    activeAttribute: PropTypes.object,
    activeAttributes: PropTypes.array,
    clearAttributes: PropTypes.func,
    isStatic: PropTypes.bool,
  };
  static defaultProps = {
    attributes: [],
    activeAttribute: {},
    activeAttributes: [],
    clearAttributes: () => {},
    isStatic: false,
  };

  onClickHome = () => {
    this.props.clearAttributes();
  };

  render() {
    const { attributes, activeAttribute, activeAttributes, isStatic } = this.props;

    return (
      <div className={cx('container', { static: isStatic })}>
        {activeAttribute
          ? activeAttributes.map((attr, i) => (
              <span key={attr.key}>
                {isStatic ? (
                  attr.key
                ) : (
                  <span className={cx('link')} onClick={this.onClickHome}>
                    {attr.key}
                  </span>
                )}
                {': '}
                {attr.value}{' '}
                {i + 1 < activeAttributes.length && (
                  <i className={cx('icon')}>{Parser(RightArrowIcon)}</i>
                )}
              </span>
            ))
          : attributes[0]}
      </div>
    );
  }
}
