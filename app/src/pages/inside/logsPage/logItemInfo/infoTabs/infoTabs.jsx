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
    activeTabId: PropTypes.string,
    setActiveTab: PropTypes.func,
    panelContent: PropTypes.node,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    tabs: [],
    activeTabId: null,
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

  isActiveTab = (tab) => this.props.activeTabId === tab.id;

  renderTabContent = (tabId, isMobileView) => {
    const tab = this.props.tabs.find((item) => item.id === tabId);
    return (
      <div className={cx('tabs-content', { mobile: isMobileView })}>
        <tab.component {...tab.componentProps} isMobileView={isMobileView} />
      </div>
    );
  };

  render() {
    const { tabs, activeTabId, setActiveTab, panelContent, tracking } = this.props;

    return (
      <div className={cx('tabs-container')}>
        <div className={cx('tabs')}>
          {tabs.map((tab) => (
            <Fragment key={tab.id}>
              <button
                className={cx('tab', { active: this.isActiveTab(tab) })}
                onClick={() => {
                  tracking.trackEvent(tab.eventInfo);
                  setActiveTab(tab.id);
                }}
              >
                {tab.icon && <i className={cx('tab-icon')}>{Parser(tab.icon)}</i>}
                {tab.label && <span className={cx('tab-label')}>{tab.label}</span>}
                <i className={cx('tab-toggle-icon', { active: this.isActiveTab(tab) })}>
                  {Parser(ArrowDownIcon)}
                </i>
              </button>
              {this.state.isMobileView &&
                this.isActiveTab(tab) &&
                this.renderTabContent(tab.id, true)}
            </Fragment>
          ))}
          {panelContent && <div className={cx('panel-content')}>{panelContent}</div>}
        </div>
        {activeTabId && !this.state.isMobileView && this.renderTabContent(activeTabId)}
      </div>
    );
  }
}
