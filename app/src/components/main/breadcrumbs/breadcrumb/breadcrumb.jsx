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

import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ListViewIcon from 'common/img/list-view-inline.svg';
import { LinkItem } from './linkItem';
import { ErrorItem } from './errorItem';
import { breadcrumbDescriptorShape } from '../propTypes';

import styles from './breadcrumb.scss';

const cx = classNames.bind(styles);

export const Breadcrumb = ({
  descriptor: { error, active, link, title, listView },
  expanded,
  onClick,
}) => (
  <div className={cx('breadcrumb')}>
    {listView && (
      <div className={cx('list-view-icon')} title={'List view'}>
        {Parser(ListViewIcon)}
      </div>
    )}
    {error ? (
      <ErrorItem />
    ) : (
      <span className={cx('link-item', { collapsed: !expanded })}>
        <LinkItem active={active} link={link} title={title} onClick={onClick} />
      </span>
    )}
  </div>
);
Breadcrumb.propTypes = {
  descriptor: breadcrumbDescriptorShape.isRequired,
  expanded: PropTypes.bool,
  onClick: PropTypes.func,
};
Breadcrumb.defaultProps = {
  expanded: true,
  onClick: () => {},
};
