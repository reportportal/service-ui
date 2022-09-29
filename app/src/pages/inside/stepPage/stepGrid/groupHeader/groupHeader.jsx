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

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { TEST_ITEM_PAGE, launchIdSelector, filterIdSelector } from 'controllers/pages';
import { isTestItemsListSelector } from 'controllers/testItem';
import { projectOrganizationSlugSelector } from 'controllers/project';
import { activeProjectKeySelector } from 'controllers/user';
import styles from './groupHeader.scss';

const cx = classNames.bind(styles);

const createLink = (projectKey, filterId, launchId, testItemIds, organizationSlug) => ({
  type: TEST_ITEM_PAGE,
  payload: {
    projectKey,
    filterId,
    testItemIds: [launchId, ...testItemIds].join('/'),
    organizationSlug,
  },
});

export const GroupHeader = connect((state) => ({
  launchId: launchIdSelector(state),
  filterId: filterIdSelector(state),
  isTestItemsList: isTestItemsListSelector(state),
  organizationSlug: projectOrganizationSlugSelector(state),
  projectKey: activeProjectKeySelector(state),
}))(({ data, launchId, filterId, isTestItemsList, organizationSlug, projectKey }) => {
  const { itemPaths = [], launchPathName } = data[0].pathNames;

  let pathNames = itemPaths;
  let sliceIndexBegin = 0;

  if (isTestItemsList) {
    const newLaunchPathName = {
      id: data[0].launchId,
      name: `${launchPathName.name} #${launchPathName.number}`,
    };

    pathNames = [newLaunchPathName, ...pathNames];
    sliceIndexBegin = 1;
  }

  return (
    <div className={cx('group-header-row')}>
      {/* td inside of div because of EPMRPP-36916 */}
      <td className={cx('group-header-content')} colSpan={100}>
        {pathNames.map((key, i, array) => (
          <Fragment key={`${key.id}${key.name}`}>
            <Link
              className={cx('link')}
              to={createLink(
                projectKey,
                filterId,
                launchId || data[0].launchId,
                array.slice(sliceIndexBegin, i + 1).map((item) => item.id),
                organizationSlug,
              )}
            >
              {key.name}
            </Link>
            {i < array.length - 1 && <span className={cx('separator')}> / </span>}
          </Fragment>
        ))}
      </td>
    </div>
  );
});
GroupHeader.propTypes = {
  data: PropTypes.array,
  organizationSlug: PropTypes.string.isRequired,
  projectKey: PropTypes.string.isRequired,
};
GroupHeader.defaultProps = {
  data: [],
};
