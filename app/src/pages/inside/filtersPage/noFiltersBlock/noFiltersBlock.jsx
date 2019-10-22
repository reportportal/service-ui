/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PureComponent } from 'react';
import track from 'react-tracking';
import { FILTERS_PAGE_EVENTS } from 'components/main/analytics/events';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { FormattedMessage } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { PROJECT_LAUNCHES_PAGE } from 'controllers/pages';
import AddFilterIcon from 'common/img/add-filter-inline.svg';
import { GhostButton } from 'components/buttons/ghostButton';
import { ALL } from 'common/constants/reservedFilterIds';

import styles from './noFiltersBlock.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
@track()
export class NoFiltersBlock extends PureComponent {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onAddFilter: PropTypes.func,
  };
  static defaultProps = {
    onAddFilter: () => {},
  };
  onClickAddFilter = () => {
    this.props.tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_ADD_BTN_EMPTY_FILTER_PAGE);
    this.props.onAddFilter();
  };
  render() {
    return (
      <div className={cx('no-filters-block')}>
        <div className={cx('flex-wrapper')}>
          <div className={cx('icon')} />
          <div className={cx('title')}>
            <FormattedMessage id={'NoFiltersBlock.title'} defaultMessage={'There are no filters'} />
          </div>
          <div className={cx('message')}>
            <FormattedMessage
              id={'NoFiltersBlock.message'}
              defaultMessage={'You can create your first filter on the '}
            />
            <Link
              className={cx('link')}
              to={{
                type: PROJECT_LAUNCHES_PAGE,
                payload: {
                  projectId: this.props.activeProject,
                  filterId: ALL,
                },
              }}
            >
              <FormattedMessage id={'NoFiltersBlock.link'} defaultMessage={'Launch Page'} />
            </Link>
          </div>
          <div className={cx('or')}>
            <FormattedMessage id={'NoFiltersBlock.or'} defaultMessage={'or'} />
          </div>
          <div className={cx('button')}>
            <GhostButton icon={AddFilterIcon} onClick={this.onClickAddFilter}>
              <FormattedMessage id={'NoFiltersBlock.Button'} defaultMessage={'Add filter'} />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
