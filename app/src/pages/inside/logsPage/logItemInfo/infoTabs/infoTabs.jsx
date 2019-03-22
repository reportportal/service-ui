import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import styles from './infoTabs.scss';

const cx = classNames.bind(styles);

@track()
export class InfoTabs extends Component {
  static propTypes = {
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        component: PropTypes.func,
        componentProps: PropTypes.object,
        icon: PropTypes.node,
      }),
    ),
    activeTab: PropTypes.object,
    setActiveTab: PropTypes.func,
    panelContent: PropTypes.node,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    tabs: [],
    activeTab: null,
    setActiveTab: () => {},
    panelContent: null,
  };

  state = {
    isMobileView: false,
  };

  componentDidMount() {
    this.match = window.matchMedia(SCREEN_XS_MAX);
    this.match.addListener(this.setMobileView);
    this.setMobileView(this.match);
  }

  componentWillUnmount() {
    if (!this.match) {
      return;
    }
    this.match.removeListener(this.setMobileView);
  }

  setMobileView = (media) =>
    media.matches !== this.state.isMobileView &&
    this.setState({
      isMobileView: media.matches,
    });

  isActiveTab(tab) {
    const { activeTab } = this.props;

    return activeTab && tab.id === activeTab.id;
  }

  render() {
    const { tabs, activeTab, setActiveTab, panelContent, tracking } = this.props;

    return (
      <div className={cx('tabs-container')}>
        <div className={cx('tabs')}>
          {tabs.map((tab) => (
            <Fragment key={tab.id}>
              <button
                className={cx('tab', { active: this.isActiveTab(tab) })}
                onClick={() => {
                  tracking.trackEvent(tab.eventInfo);
                  setActiveTab(tab);
                }}
              >
                {tab.icon && <i className={cx('tab-icon')}>{Parser(tab.icon)}</i>}
                {tab.label && <span className={cx('tab-label')}>{tab.label}</span>}
                <i className={cx('tab-toggle-icon', { active: this.isActiveTab(tab) })}>
                  {Parser(ArrowDownIcon)}
                </i>
              </button>
              {this.state.isMobileView &&
                this.isActiveTab(tab) && (
                  <div className={cx('tabs-content', 'mobile')}>
                    <tab.component {...tab.componentProps} isMobileView />
                  </div>
                )}
            </Fragment>
          ))}
          {panelContent && <div className={cx('panel-content')}>{panelContent}</div>}
        </div>
        {activeTab &&
          !this.state.isMobileView && (
            <div className={cx('tabs-content', 'desktop')}>
              <activeTab.component {...activeTab.componentProps} />
            </div>
          )}
      </div>
    );
  }
}
