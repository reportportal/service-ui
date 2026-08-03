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
import { injectIntl } from 'react-intl';
import styles from './breadcrumbs.scss';

const cx = classNames.bind(styles);

@injectIntl
export class Breadcrumbs extends PureComponent {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    activeBreadcrumbs: PropTypes.array,
    onClickBreadcrumbs: PropTypes.func,
    getKeyLabel: PropTypes.func,
    getKeyIcon: PropTypes.func,
  };

  static defaultProps = {
    breadcrumbs: [],
    activeBreadcrumbs: [],
    onClickBreadcrumbs: () => {},
    getKeyLabel: (key) => key,
    getKeyIcon: () => null,
  };

  render() {
    const { breadcrumbs, activeBreadcrumbs, onClickBreadcrumbs, getKeyLabel, getKeyIcon } =
      this.props;
    const actualBreadcrumbs = activeBreadcrumbs || breadcrumbs;

    return (
      <ul className={cx('breadcrumbs')}>
        {actualBreadcrumbs?.map((item, i) => {
          const keyLabel = getKeyLabel(item.key);
          const keyIcon = getKeyIcon(item.key);
          return (
            <li className={cx('item', { active: item.isActive })} key={item.key}>
              {!item.isStatic && !item.isActive ? (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a className={cx('link')} onClick={() => onClickBreadcrumbs(item.id)}>
                  <span className={cx('link-key')} title={keyLabel}>
                    {keyIcon && (
                      <i className={cx('key-icon')} aria-hidden="true">
                        {keyIcon}
                      </i>
                    )}
                    {keyLabel}
                  </span>
                  <span className={cx('link-value')}>
                    <span
                      className={cx('link-color')}
                      style={{ backgroundColor: item.additionalProperties.color }}
                    />
                    <span className={cx('link-value-name')} title={item.additionalProperties.value}>
                      {item.additionalProperties.value}
                    </span>
                    <span>{`, ${item.additionalProperties.passingRate}%`}</span>
                  </span>
                </a>
              ) : (
                <span className={cx('item-name')} title={keyLabel}>
                  {keyIcon && (
                    <i className={cx('key-icon')} aria-hidden="true">
                      {keyIcon}
                    </i>
                  )}
                  {keyLabel}
                </span>
              )}
              {i + 1 < actualBreadcrumbs.length && <span className={cx('icon')} />}
            </li>
          );
        })}
      </ul>
    );
  }
}
