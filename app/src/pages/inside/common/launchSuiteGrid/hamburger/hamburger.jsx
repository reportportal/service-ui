import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { CUSTOMER, PROJECT_MANAGER } from 'common/constants/projectRoles';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { activeProjectRoleSelector, isAdminSelector, userIdSelector } from 'controllers/user';
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
  isAdmin: isAdminSelector(state),
  userId: userIdSelector(state),
}))
export class Hamburger extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    userId: PropTypes.string.isRequired,
    projectRole: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onAction: PropTypes.func,
    launch: PropTypes.object.isRequired,
    onMoveToLaunches: PropTypes.func,
    onForceFinish: PropTypes.func,
    onAnalysis: PropTypes.func,
    onExportPDF: PropTypes.func,
    onExportXLS: PropTypes.func,
    onExportHTML: PropTypes.func,
    customProps: PropTypes.object,
  };

  static defaultProps = {
    onAction: () => {},
    onMoveToLaunches: () => {},
    onForceFinish: () => {},
    onAnalysis: () => {},
    onExportPDF: () => {},
    onExportXLS: () => {},
    onExportHTML: () => {},
    customProps: {},
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

  isNoPermissions = () =>
    !this.props.isAdmin &&
    this.props.projectRole !== PROJECT_MANAGER &&
    this.props.userId !== this.props.launch.owner;

  render() {
    const {
      intl,
      projectRole,
      launch,
      onMoveToLaunches,
      onForceFinish,
      onAnalysis,
      onExportPDF,
      onExportXLS,
      onExportHTML,
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
                    disabled={this.isNoPermissions()}
                    onClick={() => {
                      customProps.onMoveToDebug(launch);
                    }}
                  />
                ) : (
                  <HamburgerMenuItem
                    text={intl.formatMessage(messages.toAllLaunches)}
                    disabled={this.isNoPermissions()}
                    onClick={() => {
                      onMoveToLaunches(launch);
                    }}
                  />
                )}
              </Fragment>
            )}
            <HamburgerMenuItem
              text={intl.formatMessage(messages.forceFinish)}
              disabled={this.isNoPermissions()}
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
              disabled={this.isNoPermissions()}
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
              <div className={cx('export-button')}>
                <GhostButton
                  tiny
                  onClick={() => {
                    onExportPDF(launch);
                  }}
                >
                  PDF
                </GhostButton>
              </div>
              <div className={cx('export-button')}>
                <GhostButton
                  tiny
                  onClick={() => {
                    onExportXLS(launch);
                  }}
                >
                  XLS
                </GhostButton>
              </div>
              <div className={cx('export-button')}>
                <GhostButton
                  tiny
                  onClick={() => {
                    onExportHTML(launch);
                  }}
                >
                  HTML
                </GhostButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
