import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { SidebarButton } from 'components/main/admin/sidebarButton/sidebarButton';
import ProjectsIcon from './img/projects.svg';
import UsersIcon from './img/users.svg';
import SettingsIcon from './img/settings.svg';
import BackIcon from './img/back.svg';
import LogoutIcon from './img/logout.svg';
import ProfileIcon from './img/profile.svg';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);

export const Sidebar = ({ isMenuOpen, onClickProjects, onClickUsers, onClickServerSettings,
onClickBackToProject, onClickLogout, onClickProfile, onClickMenu }) => (
  <div className={cx({ adminSidebar: true, open: isMenuOpen })}>
    <div className={cx('mobile-header')}>
      <button onClick={onClickMenu} className={cx('button-menu-open')}>
        <i className={cx('menu-icon-part')} />
        <i className={cx('menu-icon-part')} />
        <i className={cx('menu-icon-part')} />
      </button>
      <i className={cx('mobile-logo')} />
    </div>
    <div className={cx('sidebar')}>
      <SidebarButton clickHandler={onClickProjects} icon={ProjectsIcon} >
        <FormattedMessage
          id={'AdminSidebar.allProjects'}
          defaultMessage={'Projects'}
        />
      </SidebarButton >
      <SidebarButton clickHandler={onClickUsers} icon={UsersIcon} >
        <FormattedMessage
          id={'AdminSidebar.allUsers'}
          defaultMessage={'All Users'}
        />
      </SidebarButton>
      <SidebarButton clickHandler={onClickServerSettings} icon={SettingsIcon} >
        <FormattedMessage
          id={'AdminSidebar.settings'}
          defaultMessage={'Server settings'}
        />
      </SidebarButton>
      <div className={cx('bottom-section')}>
        <SidebarButton clickHandler={onClickBackToProject} icon={BackIcon} btnBottom>
          <FormattedMessage
            id={'AdminSidebar.btnToProject'}
            defaultMessage={'Back to project'}
          />
        </SidebarButton>
        <SidebarButton clickHandler={onClickProfile} icon={ProfileIcon} btnBottom>
          <FormattedMessage
            id={'AdminSidebar.btnProfile'}
            defaultMessage={'Profile'}
          />
        </SidebarButton>
        <SidebarButton clickHandler={onClickLogout} icon={LogoutIcon} btnBottom>
          <FormattedMessage
            id={'AdminSidebar.btnLogout'}
            defaultMessage={'Logout'}
          />
        </SidebarButton>
      </div>
    </div>
  </div>
  );

Sidebar.propTypes = {
  isMenuOpen: PropTypes.bool,
  onClickProjects: PropTypes.func,
  onClickUsers: PropTypes.func,
  onClickServerSettings: PropTypes.func,
  onClickBackToProject: PropTypes.func,
  onClickLogout: PropTypes.func,
  onClickProfile: PropTypes.func,
  onClickMenu: PropTypes.func,
};

Sidebar.defaultProps = {
  isMenuOpen: false,
  onClickProjects: () => {},
  onClickUsers: () => {},
  onClickServerSettings: () => {},
  onClickBackToProject: () => {},
  onClickLogout: () => {},
  onClickProfile: () => {},
  onClickMenu: () => {},
};

