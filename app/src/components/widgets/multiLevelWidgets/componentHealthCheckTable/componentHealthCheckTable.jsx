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
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import {
  STATS_TOTAL,
  STATS_SKIPPED,
  STATS_PASSED,
  STATS_FAILED,
} from 'common/constants/statistics';
import {
  PRODUCT_BUG,
  TO_INVESTIGATE,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
} from 'common/constants/defectTypes';
import { Grid, ALIGN_CENTER, ALIGN_RIGHT } from 'components/main/grid';
import { statisticsLinkSelector, TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { getDefaultTestItemLinkParams } from 'components/widgets/common/utils';
import { Breadcrumbs } from 'components/widgets/multiLevelWidgets/common/breadcrumbs';
import {
  getNewActiveAttributes,
  getBreadcrumbs,
  getNewActiveBreadcrumbs,
} from 'components/widgets/multiLevelWidgets/common/utils';
import isEqual from 'fast-deep-equal';
import {
  NAME,
  NAME_KEY,
  CUSTOM_COLUMN,
  CUSTOM_COLUMN_KEY,
  STATUS,
  STATUS_COLUMN_KEY,
  STATISTICS_COLUMN_KEY,
  DEFECT_COLUMN_KEY,
  PASS_RATE,
  PASS_RATE_KEY,
  WIDTH_MIDDLE,
  BACKGROUND_COLOR_WHITE,
  BORDER,
} from './constants';
import {
  NameColumn,
  CustomColumn,
  StatusColumn,
  StatisticsColumn,
  DefectsColumn,
  PassingRateColumn,
} from './columns';
import { COLUMN_NAMES_MAP } from './messages';
import styles from './componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

const columnComponentsMap = {
  [NAME_KEY]: NameColumn,
  [CUSTOM_COLUMN_KEY]: CustomColumn,
  [STATUS_COLUMN_KEY]: StatusColumn,
  [STATISTICS_COLUMN_KEY]: StatisticsColumn,
  [DEFECT_COLUMN_KEY]: DefectsColumn,
  [PASS_RATE_KEY]: PassingRateColumn,
};

const COLUMNS_KEYS_MAP = {
  [NAME]: NAME_KEY,
  [CUSTOM_COLUMN]: CUSTOM_COLUMN_KEY,
  [STATUS]: STATUS_COLUMN_KEY,
  [STATS_TOTAL]: STATISTICS_COLUMN_KEY,
  [STATS_PASSED]: STATISTICS_COLUMN_KEY,
  [STATS_FAILED]: STATISTICS_COLUMN_KEY,
  [STATS_SKIPPED]: STATISTICS_COLUMN_KEY,
  [PRODUCT_BUG]: DEFECT_COLUMN_KEY,
  [AUTOMATION_BUG]: DEFECT_COLUMN_KEY,
  [SYSTEM_ISSUE]: DEFECT_COLUMN_KEY,
  [TO_INVESTIGATE]: DEFECT_COLUMN_KEY,
  [PASS_RATE]: PASS_RATE_KEY,
};

const getGridAlign = (type) => {
  switch (type) {
    case STATISTICS_COLUMN_KEY:
      return ALIGN_RIGHT;
    case STATUS_COLUMN_KEY:
      return ALIGN_CENTER;
    case DEFECT_COLUMN_KEY:
      return ALIGN_CENTER;
    case PASS_RATE_KEY:
      return ALIGN_RIGHT;
    default:
      return null;
  }
};

const getColumn = (name, customProps, customColumn) => {
  const align = getGridAlign(COLUMNS_KEYS_MAP[name]);
  const width = name === CUSTOM_COLUMN && WIDTH_MIDDLE;

  return {
    id: name,
    title: COLUMN_NAMES_MAP[name](customColumn),
    backgroundColor: BACKGROUND_COLOR_WHITE,
    border: BORDER,
    align,
    width,
    component: (data) => columnComponentsMap[COLUMNS_KEYS_MAP[name]](data, name, customProps),
  };
};

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class ComponentHealthCheckTable extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    fetchWidget: PropTypes.func,
    clearQueryParams: PropTypes.func,
    container: PropTypes.instanceOf(Element).isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    clearQueryParams: () => {},
    fetchWidget: () => {},
  };

  state = {
    activeBreadcrumbs: null,
    activeBreadcrumbId: 0,
    activeAttributes: [],
    isLoading: false,
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget.contentParameters, this.props.widget.contentParameters)) {
      this.clearState();
    }
  }

  onClickBreadcrumbs = (id) => {
    const { activeBreadcrumbs, activeAttributes, activeBreadcrumbId } = this.state;
    const {
      widget: { contentParameters },
    } = this.props;
    const attributes = contentParameters && contentParameters.widgetOptions.attributeKeys;
    const newActiveAttributes = getNewActiveAttributes(
      activeBreadcrumbs[id].key,
      activeBreadcrumbs[id].additionalProperties.value,
      activeAttributes,
    );
    const newActiveBreadcrumbs = getNewActiveBreadcrumbs(
      id,
      activeBreadcrumbs,
      activeBreadcrumbId,
      attributes,
    );

    this.setState({
      activeBreadcrumbs: newActiveBreadcrumbs,
      activeBreadcrumbId: id,
      activeAttributes: newActiveAttributes,
      isLoading: true,
    });
    this.props
      .fetchWidget({
        attributes: newActiveAttributes.map((item) => item.value),
      })
      .then(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  onClickAttribute = (value, passingRate, color) => {
    const { activeBreadcrumbs, activeBreadcrumbId, activeAttributes } = this.state;
    const {
      widget: { contentParameters },
    } = this.props;
    const attributes = contentParameters && contentParameters.widgetOptions.attributeKeys;
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

    this.setState({
      activeBreadcrumbs: newActiveBreadcrumbs,
      activeBreadcrumbId: newActiveBreadcrumbId,
      activeAttributes: newActiveAttributes,
      isLoading: true,
    });
    this.props
      .fetchWidget({
        attributes: newActiveAttributes.map((item) => item.value),
      })
      .then(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  getCustomColumn = () =>
    this.props.widget.contentParameters &&
    this.props.widget.contentParameters.widgetOptions.customColumn;

  getContentResult = () =>
    this.props.widget.content && [
      ...this.props.widget.content.result,
      { total: this.props.widget.content.total },
    ];

  getPassingRateValue = () =>
    Number(
      this.props.widget.contentParameters &&
        this.props.widget.contentParameters.widgetOptions.minPassingRate,
    );

  onStatisticsClick = (...statuses) => {
    const { widget, getStatisticsLink, project } = this.props;

    const launchesLimit = widget.contentParameters.itemsCount;
    const isLatest = widget.contentParameters.widgetOptions.latest;
    const link = getStatisticsLink({
      statuses,
      launchesLimit,
      isLatest,
    });
    const navigationParams = getDefaultTestItemLinkParams(
      project,
      widget.appliedFilters[0].id,
      TEST_ITEMS_TYPE_LIST,
    );

    return Object.assign(link, navigationParams);
  };

  isClickableAttribute = () => {
    const { activeBreadcrumbs, activeBreadcrumbId } = this.state;
    const {
      widget: { contentParameters },
    } = this.props;
    const attributes = contentParameters && contentParameters.widgetOptions.attributeKeys;
    const breadcrumbs = getBreadcrumbs(attributes, activeBreadcrumbId);

    return (
      breadcrumbs.length > 1 &&
      activeBreadcrumbId !== (activeBreadcrumbs && activeBreadcrumbs.length - 1)
    );
  };

  getColumns = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const customProps = {
      minPassingRate: this.getPassingRateValue(),
      formatMessage,
      onStatisticsClick: this.onStatisticsClick,
      onClickAttribute: this.onClickAttribute,
      isClickableAttribute: this.isClickableAttribute(),
    };
    const customColumn = this.getCustomColumn();

    return Object.keys(COLUMNS_KEYS_MAP).reduce((columns, item) => {
      if (!customColumn && item === CUSTOM_COLUMN) {
        return columns;
      }

      return [...columns, getColumn(item, customProps, customColumn)];
    }, []);
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
    const { activeBreadcrumbs, activeBreadcrumbId } = this.state;
    const {
      widget: { contentParameters },
    } = this.props;
    const attributes = contentParameters && contentParameters.widgetOptions.attributeKeys;
    const breadcrumbs = getBreadcrumbs(attributes, activeBreadcrumbId);
    const columns = this.getColumns();
    const data = this.getContentResult();

    return (
      <ScrollWrapper hideTracksWhenNotNeeded>
        <div className={cx('breadcrumbs-wrap')}>
          <Breadcrumbs
            breadcrumbs={breadcrumbs}
            activeBreadcrumbs={activeBreadcrumbs}
            onClickBreadcrumbs={this.onClickBreadcrumbs}
          />
        </div>
        {columns && (
          <Fragment>
            <Grid columns={columns} data={data} />
          </Fragment>
        )}
      </ScrollWrapper>
    );
  }
}
