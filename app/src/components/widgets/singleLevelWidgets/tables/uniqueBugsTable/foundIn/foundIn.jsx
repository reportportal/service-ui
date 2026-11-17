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

import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { ALL } from 'common/constants/reservedFilterIds';
import { PROJECT_LOG_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { AttributesBlock } from 'pages/inside/common/itemInfo/attributesBlock';
import styles from './foundIn.scss';

export const cx = classNames.bind(styles);

@connect((state) => ({
  slugs: urlOrganizationAndProjectSelector(state),
}))
export class FoundIn extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    items: PropTypes.array,
    slugs: PropTypes.shape({
      organizationSlug: PropTypes.string.isRequired,
      projectSlug: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    items: [],
  };

  getItemFragment = (item) => {
    const {
      slugs: { organizationSlug, projectSlug },
    } = this.props;
    const pathToItem = item.path || '';
    const path = `${item.launchId}/${pathToItem.replace(/\./g, '/')}`;
    const link = {
      type: PROJECT_LOG_PAGE,
      payload: {
        projectSlug,
        filterId: ALL,
        testItemIds: path,
        organizationSlug,
      },
    };

    return (
      <Fragment key={item.itemId}>
        <div className={cx('item')} title={item.itemName}>
          <Link to={link} className={cx('found-link')}>
            {item.itemName}
          </Link>
        </div>
        {item.attributes && <AttributesBlock attributes={item.attributes} />}
      </Fragment>
    );
  };

  render() {
    const { items, className } = this.props;

    return (
      <div className={cx('found-in-col', className)}>
        {items.length && items.map(this.getItemFragment)}
      </div>
    );
  }
}
