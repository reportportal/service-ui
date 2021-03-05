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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ControlPanel } from './controlPanel';
import { ruleListItemPropTypes, ruleListItemDefaultProps } from '../constants';
import { ItemContent } from './itemContent';
import styles from './listItem.scss';

const cx = classNames.bind(styles);

export const ListItem = ({
  item,
  getListItemContentData,
  contentWithScroll,
  lineHeightVariant,
  ...rest
}) => {
  const content = getListItemContentData(item).map((itemData, index) => (
    <ItemContent
      // eslint-disable-next-line react/no-array-index-key
      key={`${itemData.key}_${index}`}
      data={itemData}
      lineHeightVariant={lineHeightVariant}
    />
  ));

  return (
    <div className={cx('list-item')}>
      <ControlPanel item={item} {...rest} />
      <div className={cx('data')}>
        {contentWithScroll ? (
          <ScrollWrapper autoHeight autoHeightMax={106} hideTracksWhenNotNeeded>
            {content}
          </ScrollWrapper>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

ListItem.propTypes = {
  ...ruleListItemPropTypes,
  item: PropTypes.object,
  id: PropTypes.number,
  maxItemOrder: PropTypes.number,
  contentWithScroll: PropTypes.bool,
  lineHeightVariant: PropTypes.string,
};
ListItem.defaultProps = {
  ...ruleListItemDefaultProps,
  item: {},
  id: 0,
  maxItemOrder: 0,
  contentWithScroll: false,
  lineHeightVariant: '',
};
