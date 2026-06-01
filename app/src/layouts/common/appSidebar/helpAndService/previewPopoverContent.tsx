/*
 * Copyright 2026 EPAM Systems
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
import classNames from 'classnames/bind';
import { ArrowRightIcon } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import HelpIcon from 'common/img/help-inline.svg';

import styles from './previewPopover.scss';

const cx = classNames.bind(styles);

interface PreviewPopoverProps {
  title: string;
  isFaqTouched: boolean;
  onClick?: VoidFn;
}

export const PreviewPopover = ({ title, isFaqTouched, onClick }: PreviewPopoverProps) => (
  <button className={cx('service-wrapper')} onClick={onClick} tabIndex={0}>
    <button className={cx('service-block', { untouched: !isFaqTouched })}>
      <i>{Parser(HelpIcon)}</i>
    </button>
    <button className={cx('service-control')}>
      <div className={cx('preview')}>
        <div className={cx('content')}>
          <span className={cx('title')}>{title}</span>
          <div className={cx('arrow-icon', { untouched: !isFaqTouched })}>
            <ArrowRightIcon />
          </div>
        </div>
      </div>
    </button>
  </button>
);
