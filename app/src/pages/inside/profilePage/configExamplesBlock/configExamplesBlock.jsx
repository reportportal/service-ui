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
import { FormattedMessage } from 'react-intl';
import { ContainerWithTabs } from 'components/main/containerWithTabs';
import styles from './configExamplesBlock.scss';
import { BlockContainerHeader, BlockContainerBody } from '../blockContainer';

const cx = classNames.bind(styles);

const javaConfig = {
  name: 'Java',
  content:
  <div className={cx('content-wrapper')}>
    <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORTPORTAL.PROPERTIES FILE</h1>
    <h1 className={cx('h1')}>REQUIRED</h1>
    <div className={cx('options')}>
      <p>rp.endpoint = http://evbyminsd6293.minsk.epam.com:8080</p>
      <p>rp.uuid = 35668002-be4f-44a2-9a27-6cafcbd024b5</p>
      <p>rp.launch = superadmin_TEST_EXAMPLE</p>
      <p>rp.project = superadmin_personal</p>
    </div>
    <h1 className={cx('h1')}>NOT REQUIRED</h1>
    <div className={cx('options')}>
      <p>rp.enable = true</p>
      <p>rp.description = My awesome launch</p>
      <p>rp.tags = TAG1;TAG2</p>
      <p>rp.convertimage = true</p>
      <p>rp.mode = DEFAULT</p>
      <p>rp.skipped.issue = true</p>
      <p>rp.batch.size.logs = 20</p>
      <p>rp.keystore.resource = &lt;PATH_TO_YOUR_KEYSTORE&gt;</p>
      <p>rp.keystore.password = &lt;PASSWORD_OF_YOUR_KEYSTORE&gt;</p>
    </div>
  </div>,
};
const rubyConfig = {
  name: 'Ruby',
  content:
  <div className={cx('content-wrapper')}>
    <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORT_PORTAL.YML FILE</h1>
    <br />
    <div className={cx('options')}>
      <p>password: 35668002-be4f-44a2-9a27-6cafcbd024b5</p>
      <p>endpoint: http://evbyminsd6293.minsk.epam.com:8080/api/v1</p>
      <p>project: superadmin_personal</p>
      <p>launch: superadmin_TEST_EXAMPLE</p>
      <p>tags:  [tag1, tag2]</p>
    </div>
  </div>,
};
const soapUiConfig = {
  name: 'SoupUI',
  content:
  <div className={cx('content-wrapper')}>
    <h1 className={cx('h1')}>SET THE FOLLOWS PROPERTIES INTO PROJECT PROPERTIES OR SET THEM TO SYSTEM VARIABLES</h1>
    <br />
    <div className={cx('options')}>
      <p>rp.uuid = 35668002-be4f-44a2-9a27-6cafcbd024b5</p>
      <p>rp.endpoint = http://evbyminsd6293.minsk.epam.com:8080</p>
      <br />
      <p>rp.launch = superadmin_TEST_EXAMPLE</p>
      <p>rp.project = superadmin_personal</p>
      <p>rp.tags = TAG1;TAG2</p>
      <p>rp.description = My awesome launch</p>
    </div>
  </div>,
};
const dotNettConfig = {
  name: '.net',
  content:
  <div className={cx('content-wrapper')}>
    <h1 className={cx('h1')}>FOLLOW INSTALLER INSTRUCTIONS</h1>
  </div>,
};
const nodejsConfig = {
  name: 'NodeJS',
  content:
  <div className={cx('content-wrapper')}>
    <h1 className={cx('h1')}>FOLLOW THE <a className={cx('link')} href="https://github.com/reportportal/client-javascript">INSTRUCTION</a></h1>
    <h1 className={cx('h1')}>FOR EXAMPLE:</h1>
    <br />
    <div className={cx('options')}>
      <p>token: 35668002-be4f-44a2-9a27-6cafcbd024b5</p>
      <p>endpoint: http://evbyminsd6293.minsk.epam.com:8080/api/v1</p>
      <p>launch: superadmin_TEST_EXAMPLE</p>
      <p>project: superadmin_personal</p>
    </div>
  </div>,
};

export const ConfigExamplesBlock = () => (
  <div className={cx('config-example-block')}>
    <BlockContainerHeader>
      <span className={cx('header')}>
        <FormattedMessage id={'ConfigExamplesBlock.header'} defaultMessage={'Configuration examples'} />
      </span>
    </BlockContainerHeader>
    <BlockContainerBody>
      <div className={cx('content-container')}>
        <ContainerWithTabs
          data={[javaConfig, rubyConfig, soapUiConfig, dotNettConfig, nodejsConfig]}
        />
      </div>
    </BlockContainerBody>
  </div>
);
