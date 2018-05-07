import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { CUSTOMER } from 'common/constants/projectRoles';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { activeProjectRoleSelector } from 'controllers/user';
import styles from './hamburger.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectRole: activeProjectRoleSelector(state),
}))
export class Hamburger extends Component {
  static propTypes = {
    projectRole: PropTypes.string.isRequired,
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

  render() {
    const {
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
                  <div
                    className={cx('hamburger-menu-action')}
                    onClick={() => {
                      customProps.onMoveToDebug(launch);
                    }}
                  >
                    <FormattedMessage id={'Hamburger.toDebug'} defaultMessage={'Move to debug'} />
                  </div>
                ) : (
                  <div
                    className={cx('hamburger-menu-action')}
                    onClick={() => {
                      onMoveToLaunches(launch);
                    }}
                  >
                    <FormattedMessage
                      id={'Hamburger.toAllLaunches'}
                      defaultMessage={'Move to all launches'}
                    />
                  </div>
                )}
              </Fragment>
            )}
            <div
              className={cx('hamburger-menu-action')}
              onClick={() => {
                onForceFinish(launch);
              }}
            >
              <FormattedMessage id={'Hamburger.forceFinish'} defaultMessage={'Force Finish'} />
            </div>
            {launch.mode === 'DEFAULT' && (
              <div
                className={cx('hamburger-menu-action')}
                onClick={() => {
                  onAnalysis(launch);
                }}
              >
                <FormattedMessage id={'Hamburger.analysis'} defaultMessage={'Analysis'} />
              </div>
            )}
            <div
              className={cx('hamburger-menu-action')}
              onClick={() => {
                customProps.onDeleteItem(launch);
              }}
            >
              <FormattedMessage id={'Hamburger.delete'} defaultMessage={'Delete'} />
            </div>
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
