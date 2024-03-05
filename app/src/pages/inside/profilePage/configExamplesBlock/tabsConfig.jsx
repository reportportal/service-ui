/*
 * Copyright 2023 EPAM Systems
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

/* eslint-disable react/no-unescaped-entities */
import classNames from 'classnames/bind';
import styles from './configExamplesBlock.scss';

const cx = classNames.bind(styles);

const javaConfig = (projectKey) => ({
  name: 'Java',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORTPORTAL.PROPERTIES FILE</h1>
      <h1 className={cx('h1')}>REQUIRED</h1>
      <div className={cx('options')}>
        <p>rp.endpoint = {window.location.origin}</p>
        <p>{`rp.api.key = <API_KEY>`}</p>
        <p>rp.launch = Java launch</p>
        <p>rp.project = {projectKey}</p>
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
        <p>{`rp.keystore.resource = <PATH_TO_YOUR_KEYSTORE>`}</p>
        <p>{`rp.keystore.password = <PASSWORD_OF_YOUR_KEYSTORE>`}</p>
      </div>
      <div className={cx('note')}>
        {`NOTE: <API_KEY> should be replaced with corresponding apiKey from API KEYS tab.`}
      </div>
    </div>
  ),
});
const rubyConfig = (projectKey) => ({
  name: 'Ruby',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORT_PORTAL.YML FILE</h1>
      <div className={cx('options')}>
        <p>{`uuid: <API_KEY>`}</p>
        <p>endpoint: {window.location.origin}/api/v1</p>
        <p>project: {projectKey}</p>
        <p>launch: Ruby_launch</p>
        <p>attributes: [key:value, value]</p>
      </div>
      <div className={cx('note')}>
        {`NOTE: <API_KEY> should be replaced with corresponding apiKey from API KEYS tab.`}
      </div>
    </div>
  ),
});
const pythonConfig = (projectKey) => ({
  name: 'Python',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>
        <p>## pytest</p>
        <p>For pytest copy and save the following properties in `pytest.ini` file:</p>
      </h1>
      <h1 className={cx('h1')}>REQUIRED</h1>
      <p>[pytest]</p>
      <p>{`rp_endpoint = ${window.location.origin}`}</p>
      <p>{`rp_api_key = <API_KEY>`}</p>
      <p>{`rp_project = ${projectKey}`}</p>
      <h1 className={cx('h1')}>NOT REQUIRED</h1>
      <p>rp_launch = Pytest Launch</p>
      <p>rp_launch_description = My awesome launch</p>
      <p>rp_launch_attributes = 'tag' 'key1:value1' 'key2:value2'</p>
      <p>rp_mode = DEFAULT</p>
      <p>rp_verify_ssl = True</p>
      <p>rp_log_batch_size = 20</p>
      <p>rp_log_batch_payload_size = 64000000</p>
      <p>rp_log_level = INFO</p>
      <p>rp_ignore_attributes = 'xfail' 'usefixture'</p>
      <p>rp_is_skipped_an_issue = True</p>
      <br />
      <p>Then run tests with:</p>
      <div className={cx('options')}>
        <p>py.test ./tests --reportportal</p>
      </div>
      <p>Where './tests' is a folder with your tests.</p>
      <h1 className={cx('h1')}>
        <p>## Robot Framework</p>
        <p>Run Robot Framework with the following command line options:</p>
      </h1>
      <h1 className={cx('h1')}>REQUIRED</h1>
      <p>robot --listener robotframework_reportportal.listener \</p>
      <div className={cx('options')}>
        <p>{`--variable RP_ENDPOINT:"${window.location.origin}" \\`}</p>
        <p>{`--variable RP_API_KEY:"<API_KEY>" \\`}</p>
        <p>{`--variable RP_PROJECT:"${projectKey}" \\`}</p>
        <p>--variable RP_LAUNCH:"Robot Framework Launch" \</p>
        <p>./tests</p>
      </div>
      <br />
      <p>Where './tests' is a folder with your tests.</p>
      <h1 className={cx('h1')}>NOT REQUIRED</h1>
      <div className={cx('options')}>
        <p>--variable RP_LAUNCH_DOC:"My awesome launch" \</p>
        <p>--variable RP_LAUNCH_ATTRIBUTES:"tag key1:value1 key2:value2" \</p>
        <p>--variable RP_LOG_BATCH_SIZE:20 \</p>
        <p>--variable RP_LOG_BATCH_PAYLOAD_SIZE:64000000 \</p>
        <p>--variable RP_SKIPPED_ISSUE:True</p>
      </div>
      <h1 className={cx('h1')}>
        <p>## behave</p>
        <p>For behave copy and save the following properties in `behave.ini` file:</p>
      </h1>
      <h1 className={cx('h1')}>REQUIRED</h1>
      <p>[report_portal]</p>
      <p>{`endpoint = ${window.location.origin}`}</p>
      <p>{`api_key = <API_KEY>`}</p>
      <p>{`project = ${projectKey}`}</p>
      <h1 className={cx('h1')}>NOT REQUIRED</h1>
      <p>launch_name = Behave Launch</p>
      <p>launch_description = 'My awesome launch'</p>
      <p>launch_attributes = Smoke Env:Python3</p>
      <p>step_based = False</p>
      <p>is_skipped_an_issue = False</p>
      <p>retries = 3</p>
      <br />
      <p>Then run tests with:</p>
      <div className={cx('options')}>
        <p>behave -D config_file=behave.ini ./tests/features</p>
      </div>
      <p>Where './tests/features' is a folder with your feature files.</p>
      <div className={cx('note')}>
        {`NOTE: <API_KEY> should be replaced with corresponding apiKey from API KEYS tab.`}
      </div>
    </div>
  ),
});
const dotNetConfig = (projectName) => ({
  name: '.net',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>
        Copy and save the following properties in `ReportPortal.json` file which should be placed
        next by you test DLL:
      </h1>
      <p>{`{`}</p>
      <div className={cx('options')}>
        <p>"enabled": true,</p>
        <p>{`"server": {`}</p>
        <div className={cx('options')}>
          <p>{`"url": "${window.location.origin}",`}</p>
          <p>{`"project": "${projectName}",`}</p>
          <p>{`"apiKey": "<API_KEY>"`}</p>
        </div>
        <p>{`},`}</p>
        <p>"launch": {`{`}</p>
        <div className={cx('options')}>
          <p>"name": ".NET Launch",</p>
          <p>"description": "My awesome launch",</p>
          <p>"debugMode": false,</p>
          <p>"attributes": [ "tag1", "tag2", "platform:x64" ]</p>
        </div>
        <p>{`}`}</p>
      </div>
      <p>{`}`}</p>
      <div className={cx('note')}>
        {`NOTE: <API_KEY> should be replaced with corresponding apiKey from API KEYS tab.`}
      </div>
    </div>
  ),
});
const nodejsConfig = (projectName) => ({
  name: 'NodeJS',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>
        Choose the appropriate{' '}
        <a
          className={cx('link')}
          href="https://github.com/reportportal/client-javascript#already-implemented-listeners"
        >
          test framework integration
        </a>{' '}
        from the list and follow the configuration guide
      </h1>
      <h1 className={cx('h1')}>Fill in the agent option as described below</h1>
      <p>{`{`}</p>
      <div className={cx('options')}>
        <p>{`endpoint: "${window.location.origin}/api/v1",`}</p>
        <p>{`apiKey: "<API_KEY>",`}</p>
        <p>{`project: "${projectName}",`}</p>
        <p>launch: "Launch name",</p>
        <p>description: "My awesome launch",</p>
        <p>attributes: [</p>
        <div className={cx('options')}>
          <p>{`{`}</p>
          <div className={cx('options')}>
            <p>key: "attributeKey",</p>
            <p>value: "attributeValue",</p>
          </div>
          <p>{`},`}</p>
          <p>{`{`}</p>
          <div className={cx('options')}>
            <p>value: "anotherAttributeValue",</p>
          </div>
          <p>{`},`}</p>
        </div>
        <p>],</p>
        <p>mode: 'DEFAULT',</p>
      </div>
      <p>{`}`}</p>
      <div className={cx('note')}>
        {`NOTE: <API_KEY> should be replaced with corresponding apiKey from API KEYS tab.`}
      </div>
    </div>
  ),
});

export const TabsConfig = {
  javaConfig,
  rubyConfig,
  pythonConfig,
  dotNetConfig,
  nodejsConfig,
};
