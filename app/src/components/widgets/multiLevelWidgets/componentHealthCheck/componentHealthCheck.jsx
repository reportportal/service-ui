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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import {
  COLOR_BURGUNDY,
  COLOR_CHERRY,
  COLOR_DEEP_RED,
  COLOR_DULL_RED,
  COLOR_PASSED,
  COLOR_DULL_GREEN,
} from 'common/constants/colors';
import { formatAttribute } from 'common/utils/attributeUtils';
import { PASSED, FAILED, SKIPPED, INTERRUPTED } from 'common/constants/testStatuses';
import {
  statisticsLinkSelector,
  TEST_ITEMS_TYPE_LIST,
  DEFAULT_LAUNCHES_LIMIT,
} from 'controllers/testItem';
import { TEST_ITEM_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';
import {
  getNewActiveAttributes,
  getBreadcrumbs,
  getNewActiveBreadcrumbs,
} from 'components/widgets/multiLevelWidgets/common/utils';
import { MAX_PASSING_RATE_VALUE } from './constants';
import { ComponentHealthCheckLegend } from './legend/componentHealthCheckLegend';
import { GroupsSection } from './groupsSection';
import styles from './componentHealthCheck.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  failedGroupsTitle: {
    id: 'ComponentHealthCheck.failedGroupsTitle',
    defaultMessage: 'Failed',
  },
  passedGroupsTitle: {
    id: 'ComponentHealthCheck.passedGroupsTitle',
    defaultMessage: 'Passed',
  },
});

@injectIntl
@connect((state) => ({
  slugs: urlOrganizationAndProjectSelector(state),
  getStatisticsLink: statisticsLinkSelector(state),
}))
export class ComponentHealthCheck extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    fetchWidget: PropTypes.func,
    clearQueryParams: PropTypes.func,
    queryParameters: PropTypes.object,
    getStatisticsLink: PropTypes.func.isRequired,
    slugs: PropTypes.shape({
      organizationSlug: PropTypes.string.isRequired,
      projectSlug: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    clearQueryParams: () => {},
    fetchWidget: () => {},
    queryParameters: {},
  };

  state = {
    activeBreadcrumbs: null,
    activeBreadcrumbId: 0,
    activeAttributes: [],
    isLoading: false,
  };

  componentDidMount() {
    this.syncDrillStateFromQueryParameters();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.widget.contentParameters, this.props.widget.contentParameters)) {
      this.clearState();
      return;
    }

    if (
      !isEqual(prevProps.queryParameters, this.props.queryParameters) &&
      !this.state.isLoading
    ) {
      this.syncDrillStateFromQueryParameters();
    }

    if (prevState.isLoading && this.state.isLoading && this.props.widget !== prevProps.widget) {
      this.setState({ isLoading: false });
    }
  }

  syncDrillStateFromQueryParameters = () => {
    const { queryParameters, widget } = this.props;
    const attributeKeys = widget.contentParameters?.widgetOptions.attributeKeys || [];
    const values = queryParameters?.attributes || [];

    if (!values.length) {
      if (this.state.activeBreadcrumbId !== 0 || this.state.activeAttributes.length) {
        this.setState({
          activeBreadcrumbId: 0,
          activeAttributes: [],
          activeBreadcrumbs: null,
        });
      }
      return;
    }

    const activeAttributes = values.map((value, idx) => ({
      key: attributeKeys[idx],
      value,
    }));
    const activeBreadcrumbId = values.length;
    let activeBreadcrumbs = getBreadcrumbs(attributeKeys, 0);

    values.forEach((value, depth) => {
      const row = widget.content?.result?.find((item) => item.name === value);
      activeBreadcrumbs = getNewActiveBreadcrumbs(
        depth + 1,
        activeBreadcrumbs,
        depth,
        attributeKeys,
        {
          value,
          passingRate: row?.passingRate ?? null,
          color: null,
        },
      );
    });

    this.setState({
      activeBreadcrumbId,
      activeAttributes,
      activeBreadcrumbs,
    });
  };

  fetchDrillLevel = (attributes) => {
    return this.props
      .fetchWidget({
        attributes: attributes.map((item) => item.value),
      })
      .catch(() => {
        this.setState({ isLoading: false });
      });
  };

  onClickBreadcrumbs = (id) => {
    const { activeBreadcrumbs, activeAttributes, activeBreadcrumbId } = this.state;
    const {
      widget: { contentParameters },
    } = this.props;
    const attributes = contentParameters?.widgetOptions.attributeKeys;
    const newActiveAttributes = activeAttributes.slice(0, id);
    const newActiveBreadcrumbs = getNewActiveBreadcrumbs(
      id,
      activeBreadcrumbs,
      activeBreadcrumbId,
      attributes,
    );

    this.setState(
      {
        activeBreadcrumbs: newActiveBreadcrumbs,
        activeBreadcrumbId: id,
        activeAttributes: newActiveAttributes,
        isLoading: true,
      },
      () => this.fetchDrillLevel(newActiveAttributes),
    );
  };

  onClickGroupItem = (value, passingRate, color) => {
    const { activeBreadcrumbId, activeBreadcrumbs, activeAttributes } = this.state;
    const {
      widget: { contentParameters },
    } = this.props;
    const attributes = contentParameters?.widgetOptions.attributeKeys;
    const newActiveBreadcrumbId = activeBreadcrumbId + 1;
    const additionalProperties = {
      value,
      passingRate,
      color,
    };
    const newActiveBreadcrumbs = getNewActiveBreadcrumbs(
      newActiveBreadcrumbId,
      activeBreadcrumbs,
      activeBreadcrumbId,
      attributes,
      additionalProperties,
    );
    const newActiveAttributes = getNewActiveAttributes(
      newActiveBreadcrumbs[activeBreadcrumbId].key,
      value,
      activeAttributes,
    );

    this.setState(
      {
        activeBreadcrumbs: newActiveBreadcrumbs,
        activeBreadcrumbId: newActiveBreadcrumbId,
        activeAttributes: newActiveAttributes,
        isLoading: true,
      },
      () => this.fetchDrillLevel(newActiveAttributes),
    );
  };

  getSpecificTestListLink = (value) => {
    const { widget, getStatisticsLink } = this.props;
    const { activeBreadcrumbId, activeAttributes } = this.state;
    const attributes = widget.contentParameters?.widgetOptions.attributeKeys;
    const breadcrumbs = getBreadcrumbs(attributes, activeBreadcrumbId)[activeBreadcrumbId];
    const compositeAttributes =
      breadcrumbs && getNewActiveAttributes(breadcrumbs.key, value, activeAttributes);
    const link = getStatisticsLink({
      statuses: [PASSED, FAILED, SKIPPED, INTERRUPTED].filter(
        (status) => !(widget.contentParameters?.widgetOptions.excludeSkipped && status === SKIPPED),
      ),
      launchesLimit: DEFAULT_LAUNCHES_LIMIT,
      compositeAttribute: compositeAttributes?.map(formatAttribute).join(','),
      isLatest: widget.contentParameters.widgetOptions.latest,
    });
    const navigationParams = this.getDefaultLinkParams(widget.appliedFilters[0].id);

    return Object.assign(link, navigationParams);
  };

  getDefaultLinkParams = (filterId) => ({
    payload: {
      organizationSlug: this.props.slugs.organizationSlug,
      projectSlug: this.props.slugs.projectSlug,
      filterId,
      testItemIds: TEST_ITEMS_TYPE_LIST,
    },
    type: TEST_ITEM_PAGE,
  });

  getPassingRateValue = () =>
    Number(this.props.widget.contentParameters.widgetOptions.minPassingRate);

  getGroupItems = () => {
    const { widget } = this.props;
    const passingRate = this.getPassingRateValue();
    const failedGroupItems = [];
    const passedGroupItems = [];

    if (!widget.content.result) {
      return null;
    }

    widget.content.result.forEach((item) => {
      if (item.passingRate < passingRate) {
        failedGroupItems.push(item);
      } else {
        passedGroupItems.push(item);
      }
    });

    return {
      failedGroupItems,
      passedGroupItems,
    };
  };

  colorCalculator = (value) => {
    const passingRate = this.getPassingRateValue();
    const intervalPiece = passingRate / 4;

    if (value === MAX_PASSING_RATE_VALUE) {
      return COLOR_PASSED;
    } else if (value >= passingRate) {
      return COLOR_DULL_GREEN;
    } else if (value < 4 * intervalPiece && value > 3 * intervalPiece) {
      return COLOR_DULL_RED;
    } else if (value <= 3 * intervalPiece && value > 2 * intervalPiece) {
      return COLOR_DEEP_RED;
    } else if (value <= 2 * intervalPiece && value > intervalPiece) {
      return COLOR_CHERRY;
    }
    return COLOR_BURGUNDY;
  };

  clearState = () => {
    this.setState({
      activeBreadcrumbs: null,
      activeBreadcrumbId: 0,
      activeAttributes: [],
    });

    this.props.clearQueryParams();
  };

  render() {
    const { intl } = this.props;
    const { activeBreadcrumbs, activeBreadcrumbId, isLoading } = this.state;
    const {
      widget: { contentParameters },
    } = this.props;
    const attributes = contentParameters?.widgetOptions.attributeKeys;
    const groupItems = this.getGroupItems();
    const breadcrumbs = getBreadcrumbs(attributes, activeBreadcrumbId);
    const isClickableGroupItem =
      breadcrumbs.length > 1 &&
      activeBreadcrumbId !== (activeBreadcrumbs && activeBreadcrumbs.length - 1);

    return (
      <ScrollWrapper hideTracksWhenNotNeeded>
        <ComponentHealthCheckLegend
          breadcrumbs={breadcrumbs}
          activeBreadcrumbs={activeBreadcrumbs}
          onClickBreadcrumbs={this.onClickBreadcrumbs}
          passingRate={this.getPassingRateValue()}
          colorCalculator={this.colorCalculator}
        />
        {groupItems && !isLoading ? (
          <Fragment>
            {!!groupItems.failedGroupItems.length && (
              <GroupsSection
                sectionTitle={intl.formatMessage(messages.failedGroupsTitle)}
                itemsCount={groupItems.failedGroupItems.length}
                groups={groupItems.failedGroupItems}
                colorCalculator={this.colorCalculator}
                onClickGroupItem={this.onClickGroupItem}
                getSpecificTestListLink={this.getSpecificTestListLink}
                isClickable={isClickableGroupItem}
              />
            )}
            {!!groupItems.passedGroupItems.length && (
              <GroupsSection
                sectionTitle={intl.formatMessage(messages.passedGroupsTitle)}
                itemsCount={groupItems.passedGroupItems.length}
                groups={groupItems.passedGroupItems}
                colorCalculator={this.colorCalculator}
                onClickGroupItem={this.onClickGroupItem}
                getSpecificTestListLink={this.getSpecificTestListLink}
                isClickable={isClickableGroupItem}
              />
            )}
          </Fragment>
        ) : (
          <div className={cx('no-data-wrapper')}>
            {isLoading ? <SpinningPreloader /> : <NoDataAvailable />}
          </div>
        )}
      </ScrollWrapper>
    );
  }
}
