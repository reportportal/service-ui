import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ALL } from 'common/constants/reservedFilterIds';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { Grid } from 'components/main/grid';
import { NoItemMessage } from 'components/main/noItemMessage';
import {
  STATS_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import { activeProjectSelector } from 'controllers/user';
import {
  NameColumn,
  StatisticsColumn,
  DefectTypesColumn,
  PassingRateColumn,
} from './launchesDetailsColumns';

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class LaunchesDetailsTable extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    items: PropTypes.array,
    maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    noItemsMessage: PropTypes.string,
    onLazyLoad: PropTypes.func,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    items: [],
    maxHeight: '100%',
    noItemsMessage: '',
    onLazyLoad: null,
    loading: false,
  };

  getColumns() {
    const { activeProject } = this.props;

    const customProps = {
      linkPayload: {
        projectId: activeProject,
        filterId: ALL,
      },
    };

    const columns = [
      {
        id: 'Name',
        title: {
          full: 'name',
        },
        component: NameColumn,
        customProps,
      },
      {
        id: STATS_FAILED,
        title: {
          full: 'Failed',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'failed',
        },
      },
      {
        id: STATS_PASSED,
        title: {
          full: 'passed',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'passed',
        },
      },
      {
        id: STATS_SKIPPED,
        title: {
          full: 'skipped',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'skipped',
        },
      },
      {
        id: STATS_TOTAL,
        title: {
          full: 'total',
        },
        component: StatisticsColumn,
        customProps: {
          ...customProps,
          statsKey: 'total',
        },
      },
      {
        id: 'passingRate',
        title: {
          full: 'Pass. rate',
        },
        component: PassingRateColumn,
      },
      {
        id: 'defectType',
        title: {
          full: 'Defect type',
        },
        customProps,
        component: DefectTypesColumn,
      },
    ];
    return columns;
  }

  columns = this.getColumns();

  render() {
    const { items, loading, maxHeight, noItemsMessage, onLazyLoad } = this.props;

    return (
      <ScrollWrapper
        hideTracksWhenNotNeeded
        autoHeight
        autoHeightMax={maxHeight}
        onLazyLoad={onLazyLoad}
      >
        <Grid columns={this.columns} data={items} />
        {loading && <SpinningPreloader />}
        {!items.length && !loading && <NoItemMessage message={noItemsMessage} />}
      </ScrollWrapper>
    );
  }
}
