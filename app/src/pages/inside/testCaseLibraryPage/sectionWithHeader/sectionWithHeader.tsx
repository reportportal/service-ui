/*
 * Copyright 2025 EPAM Systems
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

import { ReactNode } from 'react';
import classNames from 'classnames/bind';

import styles from './sectionWithHeader.scss';

const cx = classNames.bind(styles);

interface SectionWithHeaderProps {
  title: string;
  headerControl?: ReactNode;
  children: ReactNode;
  className?: string;
  bindClassName?: (className?: string) => string;
}

export const SectionWithHeader = ({
  title,
  headerControl,
  children,
  className = '',
  bindClassName = () => '',
}: SectionWithHeaderProps) => (
  <div className={cx('section', className, bindClassName())}>
    <div className={cx('section__header', bindClassName('__header'))}>
      <h3 className={cx('section__title')}>{title}</h3>
      {headerControl}
    </div>
    <div className={cx('section__content', bindClassName('__section'))}>{children}</div>
  </div>
);
