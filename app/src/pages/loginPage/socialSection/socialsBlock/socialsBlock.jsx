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
import styles from './socialsBlock.scss';

const cx = classNames.bind(styles);

const SocialsBlock = () => (
  <div className={cx('socials-block')}>
    <a href="https://github.com/reportportal" target="_blank" className={cx('gh-icon')}>{}</a>
    <a href="https://www.facebook.com/ReportPortal.io" target="_blank" className={cx('fb-icon')}>{}</a>
    <a href="http://twitter.com/ReportPortal_io" target="_blank" className={cx('tw-icon')}>{}</a>
    <a href="http://youtube.com/c/ReportPortalCommunity" target="_blank" className={cx('yt-icon')}>{}</a>
    <a href="https://vk.com/reportportal_io" target="_blank" className={cx('vk-icon')}>{}</a>
    <a href="https://reportportal-slack-auto.herokuapp.com/" target="_blank" className={cx('slk-icon')}>{}</a>
    <a href="mailto:support@reportportal.io" className={cx('mail-icon')}>{}</a>
  </div>
);

export default SocialsBlock;
