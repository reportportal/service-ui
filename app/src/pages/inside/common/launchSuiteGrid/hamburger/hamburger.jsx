import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { CUSTOMER } from 'common/constants/projectRoles';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { canDeleteLaunch, canForceFinishLaunch, canMoveToDebug } from 'common/utils/permissions';
import {
  activeProjectRoleSelector,
  userIdSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { HamburgerMenuItem } from './hamburgerMenuItem';
import styles from './hamburger.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  toDebug: {
    id: 'Hamburger.toDebug',
    defaultMessage: 'Move to debug',
  },
  toAllLaunches: {
    id: 'Hamburger.toAllLaunches',
    defaultMessage: 'Move to all launches',
  },
  forceFinish: {
    id: 'Hamburger.forceFinish',
    defaultMessage: 'Force Finish',
  },
  analysis: {
    id: 'Hamburger.analysis',
    defaultMessage: 'Analysis',
  },
  delete: {
    id: 'Hamburger.delete',
    defaultMessage: 'Delete',
  },
});

@injectIntl
@connect((state) => ({
  projectRole: activeProjectRoleSelector(state),
  userId: userIdSelector(state),
  accountRole: userAccountRoleSelector(state),
}))
export class Hamburger extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    userId: PropTypes.string.isRequired,
    projectRole: PropTypes.string.isRequired,
    onAction: PropTypes.func,
    launch: PropTypes.object.isRequired,
    onMoveToLaunches: PropTypes.func,
    onForceFinish: PropTypes.func,
    onAnalysis: PropTypes.func,
    customProps: PropTypes.object,
    accountRole: PropTypes.string,
  };

  static defaultProps = {
    onAction: () => {},
    onMoveToLaunches: () => {},
    onForceFinish: () => {},
    onAnalysis: () => {},
    customProps: {},
    accountRole: '',
  };

  state = {
    menuShown: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick = (e) => {
    if (!this.icon.contains(e.target) && this.state.menuShown) {
      this.setState({ menuShown: false });
    }
  };

  toggleMenu = () => {
    this.setState({ menuShown: !this.state.menuShown });
  };

  render() {
    const {
      intl,
      projectRole,
      accountRole,
      launch,
      onMoveToLaunches,
      onForceFinish,
      onAnalysis,
      customProps,
    } = this.props;
    return (
      <div className={cx('hamburger')}>
        <div
          ref={(icon) => {
            this.icon = icon;
          }}
          className={cx('hamburger-icon')}
          onClick={this.toggleMenu}
        >
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
        </div>
        <div className={cx('hamburger-menu', { shown: this.state.menuShown })}>
          <div className={cx('hamburger-menu-actions')}>
            {projectRole !== CUSTOMER && (
              <Fragment>
                {launch.mode === 'DEFAULT' ? (
                  <HamburgerMenuItem
                    text={intl.formatMessage(messages.toDebug)}
                    disabled={
                      !canMoveToDebug(
                        accountRole,
                        projectRole,
                        this.props.userId === this.props.launch.owner,
                      )
                    }
                    onClick={() => {
                      customProps.onMoveToDebug(launch);
                    }}
                  />
                ) : (
                  <HamburgerMenuItem
                    text={intl.formatMessage(messages.toAllLaunches)}
                    disabled={
                      !canMoveToDebug(
                        accountRole,
                        projectRole,
                        this.props.userId === this.props.launch.owner,
                      )
                    }
                    onClick={() => {
                      onMoveToLaunches(launch);
                    }}
                  />
                )}
              </Fragment>
            )}
            <HamburgerMenuItem
              text={intl.formatMessage(messages.forceFinish)}
              disabled={
                !canForceFinishLaunch(
                  accountRole,
                  projectRole,
                  this.props.userId === this.props.launch.owner,
                )
              }
              onClick={() => {
                onForceFinish(launch);
              }}
            />
            {launch.mode === 'DEFAULT' && (
              <HamburgerMenuItem
                text={intl.formatMessage(messages.analysis)}
                onClick={() => {
                  onAnalysis(launch);
                }}
              />
            )}
            <HamburgerMenuItem
              text={intl.formatMessage(messages.delete)}
              disabled={
                !canDeleteLaunch(
                  accountRole,
                  projectRole,
                  this.props.userId === this.props.launch.owner,
                )
              }
              onClick={() => {
                customProps.onDeleteItem(launch);
              }}
            />
          </div>

          <div className={cx('export-block')}>
            <div className={cx('export-label')}>
              <FormattedMessage id={'Hamburger.export'} defaultMessage={'Export:'} />
            </div>
            <div className={cx('export-buttons')}>
              <a
                className={cx('export-button')}
                href={URLS.exportLaunch(projectId, launch.id, 'pdf')}
              >
                PDF
              </a>
              <a
                className={cx('export-button')}
                href={URLS.exportLaunch(projectId, launch.id, 'xls')}
              >
                XLS
              </a>
              <a
                className={cx('export-button')}
                href={URLS.exportLaunch(projectId, launch.id, 'html')}
              >
                HTML
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
