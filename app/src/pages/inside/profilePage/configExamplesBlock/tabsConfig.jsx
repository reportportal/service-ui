import classNames from 'classnames/bind';
import styles from './configExamplesBlock.scss';

const cx = classNames.bind(styles);

const javaConfig = (token) => ({
  name: 'Java',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORTPORTAL.PROPERTIES FILE</h1>
      <h1 className={cx('h1')}>REQUIRED</h1>
      <div className={cx('options')}>
        <p>rp.endpoint = http://evbyminsd6293.minsk.epam.com:8080</p>
        <p>rp.uuid = {token}</p>
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
    </div>
  ),
});
const rubyConfig = (token) => ({
  name: 'Ruby',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>COPY AND SAVE IT AS A REPORT_PORTAL.YML FILE</h1>
      <br />
      <div className={cx('options')}>
        <p>uuid: {token}</p>
        <p>endpoint: http://evbyminsd6293.minsk.epam.com:8080/api/v1</p>
        <p>project: superadmin_personal</p>
        <p>launch: superadmin_TEST_EXAMPLE</p>
        <p>tags: [tag1, tag2]</p>
      </div>
    </div>
  ),
});
const soapUiConfig = (token) => ({
  name: 'SoupUI',
  content: (
    <div className={cx('content-wrapper')}>
      <h1 className={cx('h1')}>
        SET THE FOLLOWS PROPERTIES INTO PROJECT PROPERTIES OR SET THEM TO SYSTEM VARIABLES
      </h1>
      <br />
      <div className={cx('options')}>
        <p>rp.uuid = {token}</p>
        <p>rp.endpoint = http://evbyminsd6293.minsk.epam.com:8080</p>
        <br />
        <p>rp.launch = superadmin_TEST_EXAMPLE</p>
        <p>rp.project = superadmin_personal</p>
        <p>rp.tags = TAG1;TAG2</p>
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
const nodejsConfig = (token) => ({
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
        <p>endpoint: http://evbyminsd6293.minsk.epam.com:8080/api/v1</p>
        <p>launch: superadmin_TEST_EXAMPLE</p>
        <p>project: superadmin_personal</p>
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
