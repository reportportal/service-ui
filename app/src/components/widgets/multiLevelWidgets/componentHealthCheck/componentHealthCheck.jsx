import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
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
import { formatAttribute } from 'common/utils';
import { PASSED, FAILED, SKIPPED, INTERRUPTED, IN_PROGRESS } from 'common/constants/testStatuses';
import {
  statisticsLinkSelector,
  TEST_ITEMS_TYPE_LIST,
  DEFAULT_LAUNCHES_LIMIT,
} from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { ComponentHealthCheckLegend } from './legend/componentHealthCheckLegend';
import { GroupsSection } from './groupsSection/groupsSection';
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

const MAX_PASSING_RATE_VALUE = 100;

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
export class ComponentHealthCheck extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
  };

  componentDidUpdate(prevProps) {
    if (
      !isEqual(
        prevProps.widget.contentParameters.contentFields,
        this.props.widget.contentParameters.contentFields,
      )
    ) {
      this.clearState();
    }
  }

  onClickBreadcrumbs = (id) => {
    const { activeBreadcrumbs } = this.state;
    const newActiveAttributes = this.getNewActiveAttributes(
      activeBreadcrumbs[id].key,
      activeBreadcrumbs[id].attr.value,
    );
    const newActiveBreadcrumbs = this.getNewActiveBreadcrumbs(id);

    this.setState({
      activeBreadcrumbs: newActiveBreadcrumbs,
      activeBreadcrumbId: id,
      activeAttributes: newActiveAttributes,
    });
    this.props.fetchWidget({
      attributes: newActiveAttributes.map((item) => item.value),
    });
  };

  onClickGroupItem = (value, passingRate, color) => {
    const { activeBreadcrumbId } = this.state;
    const newActiveBreadcrumbId = activeBreadcrumbId + 1;
    const attr = {
      value,
      passingRate,
      color,
    };
    const newActiveBreadcrumbs = this.getNewActiveBreadcrumbs(newActiveBreadcrumbId, attr);
    const newActiveAttributes = this.getNewActiveAttributes(
      newActiveBreadcrumbs[activeBreadcrumbId].key,
      value,
    );

    this.setState({
      activeBreadcrumbs: newActiveBreadcrumbs,
      activeBreadcrumbId: newActiveBreadcrumbId,
      activeAttributes: newActiveAttributes,
    });
    this.props.fetchWidget({
      attributes: newActiveAttributes.map((item) => item.value),
    });
  };

  onClickGroupIcon = (value) => {
    const { widget, getStatisticsLink } = this.props;
    const { activeBreadcrumbId } = this.state;
    const activeAttributes = this.getNewActiveAttributes(
      this.getBreadcrumbs()[activeBreadcrumbId].key,
      value,
    );
    const link = getStatisticsLink({
      statuses: this.getLinkParametersStatuses(),
      launchesLimit: DEFAULT_LAUNCHES_LIMIT,
      compositeAttribute: activeAttributes.map(formatAttribute).join(','),
    });
    const navigationParams = this.getDefaultParamsWidget(widget.appliedFilters[0].id);

    this.props.navigate(Object.assign(link, navigationParams));
  };

  getDefaultParamsWidget = (filterId) => ({
    payload: {
      projectId: this.props.project,
      filterId,
      testItemIds: TEST_ITEMS_TYPE_LIST,
    },
    type: TEST_ITEM_PAGE,
  });

  getLinkParametersStatuses = () => [PASSED, FAILED, SKIPPED, INTERRUPTED, IN_PROGRESS];

  getNewActiveAttributes = (key, value) => {
    const { activeAttributes } = this.state;
    const activeAttribute = {
      key,
      value,
    };
    const indexActiveAttribute =
      activeAttributes &&
      activeAttributes.indexOf(activeAttributes.find((item) => item.key === key));

    if (indexActiveAttribute !== -1) {
      return activeAttributes.slice(0, indexActiveAttribute);
    }

    return [...activeAttributes, activeAttribute];
  };

  getNewActiveBreadcrumbs = (id, attr) => {
    const { activeBreadcrumbs } = this.state;
    const actualBreadcrumbs = activeBreadcrumbs || this.getBreadcrumbs();

    return (
      actualBreadcrumbs &&
      actualBreadcrumbs.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            isStatic: true,
            isActive: true,
            attr: null,
          };
        }

        if (attr && item.id === id - 1) {
          return {
            ...item,
            isStatic: false,
            isActive: false,
            attr,
          };
        }

        if (!attr && item.id > id) {
          return {
            ...item,
            isStatic: true,
            isActive: false,
            attr: null,
          };
        }

        return {
          ...item,
        };
      })
    );
  };

  getBreadcrumbs = () =>
    this.props.widget.contentParameters.contentFields.map((item, index) => ({
      id: index,
      key: item,
      isStatic: true,
      isActive: this.state.activeBreadcrumbId === index,
      attr: {
        color: null,
        value: null,
        passingRate: null,
      },
    }));

  getPassingRateValue = () => this.props.widget.contentParameters.itemsCount;

  getGroupItems = () => {
    const { widget } = this.props;
    const passingRate = widget.contentParameters.itemsCount;
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
    const intervalPiece = (passingRate - 1) / 4;

    if (value === MAX_PASSING_RATE_VALUE) {
      return COLOR_PASSED;
    } else if (value >= passingRate) {
      return COLOR_DULL_GREEN;
    } else if (value <= 4 * intervalPiece && value > 3 * intervalPiece) {
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
    const { activeBreadcrumbs, activeBreadcrumbId } = this.state;
    const groupItems = this.getGroupItems();
    const isClickableGroupItem =
      activeBreadcrumbId !== (activeBreadcrumbs && activeBreadcrumbs.length - 1);

    return (
      <ScrollWrapper hideTracksWhenNotNeeded>
        <ComponentHealthCheckLegend
          breadcrumbs={this.getBreadcrumbs()}
          activeBreadcrumbs={activeBreadcrumbs}
          onClickBreadcrumbs={this.onClickBreadcrumbs}
          passingRate={this.getPassingRateValue()}
          colorCalculator={this.colorCalculator}
        />
        {groupItems ? (
          <Fragment>
            {!!groupItems.failedGroupItems.length && (
              <GroupsSection
                sectionTitle={intl.formatMessage(messages.failedGroupsTitle)}
                itemsCount={groupItems.failedGroupItems.length}
                groups={groupItems.failedGroupItems}
                colorCalculator={this.colorCalculator}
                onClickGroupItem={this.onClickGroupItem}
                onClickGroupIcon={this.onClickGroupIcon}
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
                onClickGroupIcon={this.onClickGroupIcon}
                isClickable={isClickableGroupItem}
              />
            )}
          </Fragment>
        ) : (
          <div className={cx('no-data-wrapper')}>
            <NoDataAvailable />
          </div>
        )}
      </ScrollWrapper>
    );
  }
}
