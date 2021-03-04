/*
 * Copyright 2021 EPAM Systems
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { AccordionTab } from './accordionTab';
import styles from './accordion.scss';

const cx = classNames.bind(styles);

export const Accordion = ({
  renderedData,
  firstTabActive,
  headerClassNames,
  contentClassNames,
}) => {
  const [activeTabIdx, setActiveTabIdx] = useState(firstTabActive ? 0 : null);

  return (
    <div className={cx('accordion')}>
      {renderedData &&
        renderedData.map((section, index) => (
          <AccordionTab
            section={section}
            activeTabIdx={activeTabIdx}
            setActiveTabIdx={setActiveTabIdx}
            key={index.toString()}
            currentTabIdx={index}
            headerClassNames={headerClassNames}
            contentClassNames={contentClassNames}
          />
        ))}
    </div>
  );
};
Accordion.propTypes = {
  renderedData: PropTypes.array,
  firstTabActive: PropTypes.bool,
  headerClassNames: PropTypes.string,
  contentClassNames: PropTypes.string,
};
Accordion.defaultProps = {
  renderedData: [],
  firstTabActive: false,
  headerClassNames: '',
  contentClassNames: '',
};
