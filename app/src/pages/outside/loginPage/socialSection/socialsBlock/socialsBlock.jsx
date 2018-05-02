/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import classNames from 'classnames/bind';
import { referenceDictionary } from 'common/utils';
import styles from './socialsBlock.scss';

const cx = classNames.bind(styles);

export const SocialsBlock = () => (
  <div className={cx('socials-block')}>
    <a href={referenceDictionary.rpGitHub} target="_blank" className={cx({ 'social-link': true, 'gh-icon': true })}>{}</a>
    <a href={referenceDictionary.rpGitHub} target="_blank" className={cx({ 'social-link': true, 'fb-icon': true })}>{}</a>
    <a href={referenceDictionary.rpGitHub} target="_blank" className={cx({ 'social-link': true, 'tw-icon': true })}>{}</a>
    <a href={referenceDictionary.rpGitHub} target="_blank" className={cx({ 'social-link': true, 'yt-icon': true })}>{}</a>
    <a href={referenceDictionary.rpGitHub} target="_blank" className={cx({ 'social-link': true, 'vk-icon': true })}>{}</a>
    <a href={referenceDictionary.rpGitHub} target="_blank" className={cx({ 'social-link': true, 'slk-icon': true })}>{}</a>
    <a href={referenceDictionary.rpGitHub} className={cx({ 'social-link': true, 'mail-icon': true })}>{}</a>
  </div>
);
