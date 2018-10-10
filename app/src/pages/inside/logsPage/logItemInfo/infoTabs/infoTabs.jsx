import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import styles from './infoTabs.scss';

const cx = classNames.bind(styles);

export class InfoTabs extends Component {
  static propTypes = {
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        content: PropTypes.node.isRequired,
        icon: PropTypes.node,
      }),
    ),
    panelContent: PropTypes.node,
  };

  static defaultProps = {
    tabs: [],
    panelContent: null,
  };

  state = {
    activeTab: null,
  };

  setActiveTab(tab) {
    this.setState({
      activeTab: this.isActiveTab(tab) ? null : tab,
    });
  }

  isActiveTab(tab) {
    const { activeTab } = this.state;

    return activeTab && tab.id === activeTab.id;
  }

  render() {
    const { activeTab } = this.state;
    const { tabs, panelContent } = this.props;

    return (
      <div className={cx('tabs-container')}>
        <div className={cx('tabs')}>
          {tabs.map((tab) => (
            <Fragment key={tab.id}>
              <button
                className={cx('tab', { active: this.isActiveTab(tab) })}
                onClick={() => this.setActiveTab(tab)}
              >
                {tab.icon && <i className={cx('tab-icon')}>{Parser(tab.icon)}</i>}
                {tab.label && <span className={cx('tab-label')}>{tab.label}</span>}
                <i className={cx('tab-toggle-icon', { active: this.isActiveTab(tab) })}>
                  {Parser(ArrowDownIcon)}
                </i>
              </button>
              {this.isActiveTab(tab) && (
                <div className={cx('tabs-content', 'mobile')}>{tab.content}</div>
              )}
            </Fragment>
          ))}
          {panelContent && <div className={cx('panel-content')}>{panelContent}</div>}
        </div>
        {activeTab && (
          <div className={cx('tabs-content', 'desktop')}>
            {tabs.find((tab) => tab.id === activeTab.id).content}
          </div>
        )}
      </div>
    );
  }
}
