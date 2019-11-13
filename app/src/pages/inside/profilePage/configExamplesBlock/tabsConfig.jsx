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

import classNames from 'classnames/bind';
import styles from './configExamplesBlock.scss';

const cx = classNames.bind(styles);

const javaConfig = (token, activeProject, login) => ({
  name: 'Java',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORTPORTAL.PROPERTIES FILE</h1>
      <h1 className={cx('h1')}>REQUIRED</h1>
      <div className={cx('options')}>
        <p>rp.endpoint = {window.location.origin}</p>
        <p>rp.uuid = {token}</p>
        <p>rp.launch = {login}_TEST_EXAMPLE</p>
        <p>rp.project = {activeProject}</p>
      </div>
      <h1 className={cx('h1')}>NOT REQUIRED</h1>
      <div className={cx('options')}>
        <p>rp.enable = true</p>
        <p>rp.description = My awesome launch</p>
        <p>rp.attributes = key:value; value;</p>
        <p>rp.convertimage = true</p>
        <p>rp.mode = DEFAULT</p>
        <p>rp.skipped.issue = true</p>
        <p>rp.batch.size.logs = 20</p>
        <p>rp.keystore.resource = &lt;PATH_TO_YOUR_KEYSTORE&gt;</p>
        <p>rp.keystore.password = &lt;PASSWORD_OF_YOUR_KEYSTORE&gt;</p>
      </div>
    </div>
  ),
});
const rubyConfig = (token, activeProject, login) => ({
  name: 'Ruby',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORT_PORTAL.YML FILE</h1>
      <br />
      <div className={cx('options')}>
        <p>uuid: {token}</p>
        <p>endpoint: {window.location.origin}/api/v1</p>
        <p>project: {activeProject}</p>
        <p>launch: {login}_TEST_EXAMPLE</p>
        <p>attributes: [key:value, value]</p>
      </div>
    </div>
  ),
});
const soapUiConfig = (token, activeProject, login) => ({
  name: 'SoupUI',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>
        SET THE FOLLOWS PROPERTIES INTO PROJECT PROPERTIES OR SET THEM TO SYSTEM VARIABLES
      </h1>
      <br />
      <div className={cx('options')}>
        <p>rp.uuid = {token}</p>
        <p>rp.endpoint = {window.location.origin}</p>
        <br />
        <p>rp.launch = {login}_TEST_EXAMPLE</p>
        <p>rp.project = {activeProject}</p>
        <p>rp.attributes = key:value; value;</p>
        <p>rp.description = My awesome launch</p>
      </div>
    </div>
  ),
});
const dotNetConfig = {
  name: '.net',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>FOLLOW INSTALLER INSTRUCTIONS</h1>
    </div>
  ),
};
const nodejsConfig = (token, activeProject, login) => ({
  name: 'NodeJS',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>
        FOLLOW THE{' '}
        <a className={cx('link')} href="https://github.com/reportportal/client-javascript">
          INSTRUCTION
        </a>
      </h1>
      <h1 className={cx('h1')}>FOR EXAMPLE:</h1>
      <br />
      <div className={cx('options')}>
        <p>uuid: {token}</p>
        <p>endpoint: {window.location.origin}/api/v1</p>
        <p>launch: {login}_TEST_EXAMPLE</p>
        <p>project: {activeProject}</p>
      </div>
    </div>
  ),
});

export const TabsConfig = {
  javaConfig,
  rubyConfig,
  soapUiConfig,
  dotNetConfig,
  nodejsConfig,
};
