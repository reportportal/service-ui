import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { redirect as redirectAction } from 'redux-first-router';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import { breadcrumbsSelector } from 'controllers/testItem';
import {
  nextLogLinkSelector,
  previousLogLinkSelector,
  previousItemSelector,
  nextItemSelector,
} from 'controllers/log';
import styles from './logToolbar.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    nextLink: nextLogLinkSelector(state),
    previousLink: previousLogLinkSelector(state),
    previousItem: previousItemSelector(state),
    nextItem: nextItemSelector(state),
  }),
  {
    redirect: redirectAction,
  },
)
export class LogToolbar extends Component {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    onRefresh: PropTypes.func,
    previousItem: PropTypes.object,
    nextItem: PropTypes.object,
    nextLink: PropTypes.object,
    previousLink: PropTypes.object,
    redirect: PropTypes.func,
  };

  static defaultProps = {
    breadcrumbs: [],
    onRefresh: () => {},
    previousItem: null,
    nextItem: null,
    nextLink: null,
    previousLink: null,
    redirect: () => {},
  };

  handleBackClick = () => {
    const { redirect, previousLink } = this.props;
    redirect(previousLink);
  };
  handleForwardClick = () => {
    const { redirect, nextLink } = this.props;
    redirect(nextLink);
  };

  render() {
    const { breadcrumbs, previousLink, nextLink, previousItem, nextItem, onRefresh } = this.props;
    return (
      <div className={cx('log-toolbar')}>
        <Breadcrumbs
          descriptors={breadcrumbs}
          togglerEventInfo={LOG_PAGE_EVENTS.PLUS_MINUS_BREADCRUMB}
          breadcrumbEventInfo={LOG_PAGE_EVENTS.ITEM_NAME_BREADCRUMB_CLICK}
          allEventClick={LOG_PAGE_EVENTS.ALL_LABEL_BREADCRUMB}
        />
        <div className={cx('action-buttons')}>
          <div className={cx('action-button')}>
            <div className={cx('left-arrow-button')}>
              <GhostButton
                icon={LeftArrowIcon}
                disabled={!previousLink}
                title={previousItem && previousItem.name}
                onClick={this.handleBackClick}
              />
            </div>
            <GhostButton
              icon={RightArrowIcon}
              disabled={!nextLink}
              title={nextItem && nextItem.name}
              onClick={this.handleForwardClick}
            />
          </div>
          <div className={cx('action-button')}>
            <GhostButton icon={RefreshIcon} onClick={onRefresh}>
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
