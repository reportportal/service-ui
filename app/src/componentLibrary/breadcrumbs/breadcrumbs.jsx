/*
 * Copyright 2022 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { BackBreadcrumb } from './backBreadcrumb';
import { Breadcrumb } from './breadcrumb';
import { Meatball } from './meatball';
import styles from './breadcrumbs.scss';

const cx = classNames.bind(styles);
const MAX_BREADCRUMBS_WIDTH = 740;
const MEATBALL_WIDTH = 36;
const ARROW_WIDTH = 20;
const MAX_SHOWN_DESCRIPTORS = 5;

export const Breadcrumbs = ({ descriptors, dataAutomationId }) => {
  const shownDescriptors = [...descriptors];

  const titleTailNumChars = ((breadcrumbsCount) => {
    if (breadcrumbsCount >= MAX_SHOWN_DESCRIPTORS) {
      return 12;
    } else if (breadcrumbsCount === 4) {
      return 13;
    } else if (breadcrumbsCount === 3) {
      return 18;
    } else if (breadcrumbsCount === 2) {
      return 24;
    } else {
      return 55;
    }
  })(descriptors.length);

  let hiddenDescriptors = [];
  if (shownDescriptors.length > MAX_SHOWN_DESCRIPTORS) {
    hiddenDescriptors = shownDescriptors.splice(
      1,
      shownDescriptors.length - (MAX_SHOWN_DESCRIPTORS - 1),
    );
  }

  const maxBreadcrumbWidth =
    (MAX_BREADCRUMBS_WIDTH -
      (hiddenDescriptors.length ? MEATBALL_WIDTH : 0) -
      (shownDescriptors.length - 1) * ARROW_WIDTH) /
    shownDescriptors.length;

  return (
    <div className={cx('breadcrumbs-container')} data-automation-id={dataAutomationId}>
      {descriptors.length === 1 ? (
        <BackBreadcrumb
          maxBreadcrumbWidth={maxBreadcrumbWidth}
          descriptor={descriptors[0]}
          titleTailNumChars={titleTailNumChars}
        />
      ) : (
        <div className={cx('breadcrumbs')}>
          {hiddenDescriptors.length ? (
            <>
              <Breadcrumb
                descriptor={descriptors[0]}
                maxBreadcrumbWidth={maxBreadcrumbWidth}
                titleTailNumChars={titleTailNumChars}
              />
              <div className={cx('meatball')}>
                <Meatball descriptors={hiddenDescriptors} />
              </div>
              {shownDescriptors.map((descriptor, index) => {
                if (index !== 0) {
                  return (
                    <Breadcrumb
                      key={descriptor.id}
                      descriptor={descriptor}
                      maxBreadcrumbWidth={maxBreadcrumbWidth}
                      titleTailNumChars={titleTailNumChars}
                      isClickable={index !== shownDescriptors.length - 1}
                    />
                  );
                }
                return null;
              })}
            </>
          ) : (
            <>
              {shownDescriptors.map((descriptor, index) => (
                <Breadcrumb
                  key={descriptor.id}
                  descriptor={descriptor}
                  maxBreadcrumbWidth={maxBreadcrumbWidth}
                  titleTailNumChars={titleTailNumChars}
                  isClickable={index !== shownDescriptors.length - 1}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

Breadcrumbs.propTypes = {
  descriptors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      link: PropTypes.object,
      onClick: PropTypes.func,
    }),
  ),
  dataAutomationId: PropTypes.string,
};

Breadcrumbs.defaultProps = {
  descriptors: [],
  dataAutomationId: '',
};
