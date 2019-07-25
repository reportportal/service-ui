import classNames from 'classnames/bind';
import { GithubAuthForm, ActiveDirectoryAuthForm, LdapAuthForm } from './forms';
import styles from './authConfigurationTab.scss';

const cx = classNames.bind(styles);

export const AuthConfigurationTab = () => (
  <div className={cx('auth-configuration-tab')}>
    <GithubAuthForm />
    <ActiveDirectoryAuthForm />
    <LdapAuthForm />
  </div>
);
