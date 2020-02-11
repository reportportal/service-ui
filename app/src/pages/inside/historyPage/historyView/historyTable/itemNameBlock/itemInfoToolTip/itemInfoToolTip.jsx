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

import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { FormattedRelativeTime } from 'react-intl';
import classNames from 'classnames/bind';
import { MarkdownViewer } from 'components/main/markdown';
import { getRelativeUnits } from 'common/utils/timeDateUtils';
import TagIcon from 'common/img/tag-inline.svg';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import styles from './itemInfoToolTip.scss';

const cx = classNames.bind(styles);

export const ItemInfoToolTip = ({ data }) => {
  const { value: startTime, unit } = getRelativeUnits(data.startTime);
  return (
    <div className={cx('info-tooltip-wrapper')}>
      <div className={cx('title-block')}>
        <span>{data.name}</span>
      </div>
      <div className={cx('info-block')}>
        <DurationBlock
          timing={{
            start: data.startTime,
            end: data.endTime,
          }}
        />
        <span className={cx('separator')} />
        <div className={cx('date-info')}>
          <FormattedRelativeTime value={startTime} unit={unit} numeric="auto" />
        </div>
        {data.tags && (
          <div className={cx('tags-info')}>
            <div className={cx('icon')}>{Parser(TagIcon)}</div>
            {data.tags.map((item) => (
              <span key={item} className={cx('tag-item')}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
      <MarkdownViewer value={data.description} />
    </div>
  );
};
ItemInfoToolTip.propTypes = {
  data: PropTypes.object,
};
ItemInfoToolTip.defaultProps = {
  data: {},
};
