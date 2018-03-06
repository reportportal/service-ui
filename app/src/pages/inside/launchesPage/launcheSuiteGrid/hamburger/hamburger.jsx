import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import styles from './hamburger.scss';

const cx = classNames.bind(styles);

export class Hamburger extends Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    onAction: PropTypes.func,
  };
  static defaultProps = {
    onAction: () => {},
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
    return (
      <div className={cx('hamburger')}>
        <div ref={(icon) => { this.icon = icon; }} className={cx('hamburger-icon')} onClick={this.toggleMenu}>
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
        </div>
        <div className={cx({ 'hamburger-menu': true, shown: this.state.menuShown })}>
          <div className={cx('hamburger-menu-actions')}>
            {
              (this.props.mode === 'DEFAULT')
                ?
                  <div className={cx('hamburger-menu-action')} onClick={() => { this.props.onAction('move-to-debug'); }}>
                    <FormattedMessage id={'Hamburger.toDebug'} defaultMessage={'Move to debug'} />
                  </div>
                :
                  <div className={cx('hamburger-menu-action')} onClick={() => { this.props.onAction('move-to-launches'); }}>
                    <FormattedMessage id={'Hamburger.toAllLaunches'} defaultMessage={'Move to all launches'} />
                  </div>
            }
            <div className={cx('hamburger-menu-action')} onClick={() => { this.props.onAction('force-finish'); }}>
              <FormattedMessage id={'Hamburger.forceFinish'} defaultMessage={'Force Finish'} />
            </div>
            {
              (this.props.mode === 'DEFAULT')
                ?
                  <div className={cx('hamburger-menu-action')} onClick={() => { this.props.onAction('analysis'); }}>
                    <FormattedMessage id={'Hamburger.analysis'} defaultMessage={'Analysis'} />
                  </div>
                :
                null
            }
            <div className={cx('hamburger-menu-action')} onClick={() => { this.props.onAction('delete'); }}>
              <FormattedMessage id={'Hamburger.delete'} defaultMessage={'Delete'} />
            </div>
          </div>

          <div className={cx('export-block')}>
            <div className={cx('export-label')}>
              <FormattedMessage id={'Hamburger.export'} defaultMessage={'Export:'} />
            </div>
            <div className={cx('export-buttons')}>
              <div className={cx('export-button')}>
                <GhostButton tiny onClick={() => { this.props.onAction('export-PDF'); }}>PDF</GhostButton>
              </div>
              <div className={cx('export-button')}>
                <GhostButton tiny onClick={() => { this.props.onAction('export-XLS'); }}>XLS</GhostButton>
              </div>
              <div className={cx('export-button')}>
                <GhostButton tiny onClick={() => { this.props.onAction('export-HTML'); }}>HTML</GhostButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
