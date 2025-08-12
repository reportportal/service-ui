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

import classNames from 'classnames/bind';
import styles from './infoBlock.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface InfoBlockProps {
  label: string;
  className?: string;
}

export const InfoBlock = ({ label, className = '' }: InfoBlockProps) => (
  <div className={cx('info-block', className)}>
    <span className={cx('info-block__label')}>{label}</span>
  </div>
);
