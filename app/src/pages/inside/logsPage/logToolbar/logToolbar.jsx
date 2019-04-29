import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import {
  breadcrumbsSelector,
  namespaceSelector,
  fetchTestItemsFromLogPageAction,
} from 'controllers/testItem';
import { withPagination } from 'controllers/pagination';
import {
  nextLogLinkSelector,
  previousLogLinkSelector,
  previousItemSelector,
  nextItemSelector,
  disablePrevItemLinkSelector,
  disableNextItemLinkSelector,
} from 'controllers/log';

import { stepPaginationSelector } from 'controllers/step';
import styles from './logToolbar.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
    nextLink: nextLogLinkSelector(state),
    previousLink: previousLogLinkSelector(state),
    previousItem: previousItemSelector(state),
    nextItem: nextItemSelector(state),
    previousLinkDisable: disablePrevItemLinkSelector(state),
    nextLinkDisable: disableNextItemLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
    fetchTestItems: fetchTestItemsFromLogPageAction,
  },
)
@withPagination({
  paginationSelector: stepPaginationSelector,
  namespaceSelector,
  offset: 1,
})
export class LogToolbar extends Component {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    onRefresh: PropTypes.func,
    previousItem: PropTypes.object,
    nextItem: PropTypes.object,
    nextLink: PropTypes.object,
    previousLink: PropTypes.object,
    navigate: PropTypes.func,
    previousLinkDisable: PropTypes.bool,
    nextLinkDisable: PropTypes.bool,
    onChangePage: PropTypes.func,
    activePage: PropTypes.number,
    fetchTestItems: PropTypes.func,
  };

  static defaultProps = {
    breadcrumbs: [],
    onRefresh: () => {},
    previousItem: null,
    nextItem: null,
    nextLink: null,
    previousLink: null,
    navigate: () => {},
    previousLinkDisable: false,
    nextLinkDisable: false,
    onChangePage: () => {},
    activePage: 1,
    fetchTestItems: () => {},
  };

  handleBackClick = () => {
    const { navigate, previousLink, fetchTestItems } = this.props;
    if (previousLink) {
      return navigate(previousLink);
    }
    return fetchTestItems();
  };
  handleForwardClick = () => {
    const { fetchTestItems, nextLink, navigate } = this.props;
    if (nextLink) {
      return navigate(nextLink);
    }
    return fetchTestItems({ next: true });
  };

  render() {
    const {
      breadcrumbs,
      previousItem,
      nextItem,
      onRefresh,
      previousLinkDisable,
      nextLinkDisable,
    } = this.props;
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
                disabled={previousLinkDisable}
                title={previousItem && previousItem.name}
                onClick={this.handleBackClick}
              />
            </div>
            <GhostButton
              icon={RightArrowIcon}
              disabled={nextLinkDisable}
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
