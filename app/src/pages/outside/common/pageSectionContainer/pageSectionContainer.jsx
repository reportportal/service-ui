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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { SectionBlockHeader } from './blockHeader';
import styles from './pageSectionContainer.scss';

const cx = classNames.bind(styles);

export const PageSectionContainer = ({
  header,
  hint,
  hintParams,
  leftAligned,
  hideHeader,
  children,
  customClassName,
  compactHeaderSpacing,
}) => (
  <div className={cx('page-section-container', customClassName)}>
    {!hideHeader && header?.id && (
      <SectionBlockHeader
        header={header}
        hint={hint}
        hintParams={hintParams}
        leftAligned={leftAligned}
        compactBottomSpacing={compactHeaderSpacing}
      />
    )}
    {children}
  </div>
);
PageSectionContainer.propTypes = {
  header: PropTypes.object,
  hint: PropTypes.object,
  hintParams: PropTypes.object,
  leftAligned: PropTypes.bool,
  hideHeader: PropTypes.bool,
  children: PropTypes.node,
  customClassName: PropTypes.string,
  compactHeaderSpacing: PropTypes.bool,
};
PageSectionContainer.defaultProps = {
  header: {},
  hint: {},
  hintParams: {},
  leftAligned: false,
  hideHeader: false,
  children: null,
  customClassName: '',
  compactHeaderSpacing: false,
};
