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
import { getTabsState } from 'pages/inside/common/accordion/utils';
import { AccordionTab } from './accordionTab';
import styles from './accordion.scss';

const cx = classNames.bind(styles);

export const Accordion = ({ renderedData, headerClassNames, contentClassNames }) => {
  const initialTabsState = getTabsState(renderedData);
  const [tabsState, setTabsState] = useState(initialTabsState);

  return (
    <div className={cx('accordion')}>
      {renderedData.length > 0 &&
        renderedData.map((tab) => (
          <AccordionTab
            tab={tab}
            tabsState={tabsState}
            setTabsState={setTabsState}
            key={tab.id}
            headerClassNames={headerClassNames}
            contentClassNames={contentClassNames}
          />
        ))}
    </div>
  );
};
Accordion.propTypes = {
  renderedData: PropTypes.array,
  headerClassNames: PropTypes.string,
  contentClassNames: PropTypes.string,
};
Accordion.defaultProps = {
  renderedData: [],
  headerClassNames: '',
  contentClassNames: '',
};
