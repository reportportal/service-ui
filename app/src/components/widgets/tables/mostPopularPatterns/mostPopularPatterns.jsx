import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { getQueryNamespace } from 'controllers/testItem/utils';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { PatternGrid } from './patternGrid';
import { SecondLevelPanel } from './secondLevelPanel';
import styles from './mostPopularPatterns.scss';

const PATTERN_FILTER_PARAM = 'patternTemplateName';
const cx = classNames.bind(styles);

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
export class MostPopularPatterns extends Component {
  static propTypes = {
    widget: PropTypes.object,
    fetchWidget: PropTypes.func,
    queryParameters: PropTypes.object,
    clearQueryParams: PropTypes.func,
    projectId: PropTypes.string,
  };

  static defaultProps = {
    widget: {
      appliedFilters: [
        {
          id: 'all',
        },
      ],
      content: {
        result: [],
      },
      contentParameters: {
        widgetOptions: {
          attributeKey: '',
        },
      },
    },
    fetchWidget: () => {},
    queryParameters: {},
    clearQueryParams: () => {},
    projectId: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedAttribute: this.getDefaultAttribute(props.widget.content.result),
      selectedPattern: props.queryParameters.patternTemplateName,
    };
  }

  onBackClick = () => {
    this.setState({
      selectedPattern: null,
    });
    this.props.clearQueryParams();
  };

  onPatternClick = (pattern) => {
    this.setState({
      selectedPattern: pattern,
    });
    this.props.fetchWidget({
      [PATTERN_FILTER_PARAM]: pattern,
    });
  };

  onChangeAttribute = (newAttribute) =>
    this.setState({
      selectedAttribute: newAttribute,
    });

  getAttributes = (data) =>
    data.map((group) => ({
      label: group.attributeValue,
      value: group.attributeValue,
    }));

  getDefaultAttribute = (data) => (this.getAttributes(data) || [{}]).pop().value;

  getDataByAttribute = (data, attribute) =>
    (data.find((group) => group.attributeValue === attribute) || {}).patterns;

  getLinkToLaunch = (launchId) => {
    const {
      projectId,
      widget: { appliedFilters },
    } = this.props;
    const filterId = appliedFilters && appliedFilters.length ? appliedFilters[0].id : 'all';
    return {
      type: TEST_ITEM_PAGE,
      payload: {
        projectId,
        filterId,
        testItemIds: launchId,
      },
      meta: {
        query: createNamespacedQuery(
          {
            'filter.eq.hasChildren': false,
            'filter.any.patternName': this.state.selectedPattern,
          },
          getQueryNamespace(0),
        ),
      },
    };
  };

  render() {
    const {
      widget: {
        content: { result },
        contentParameters: {
          widgetOptions: { attributeKey },
        },
      },
    } = this.props;
    const { selectedAttribute, selectedPattern } = this.state;
    return (
      <div className={cx('popular-patterns')}>
        <div className={cx('attribute-selector')}>
          <div className={cx('attribute-label')}>{attributeKey}</div>
          <div className={cx('attribute-input')}>
            <InputDropdown
              options={this.getAttributes(result)}
              onChange={this.onChangeAttribute}
              value={selectedAttribute}
            />
          </div>
        </div>
        {selectedPattern && (
          <SecondLevelPanel patternName={selectedPattern} onBackClick={this.onBackClick} />
        )}
        <div className={cx('patterns-grid')}>
          <ScrollWrapper>
            <PatternGrid
              data={this.getDataByAttribute(result, selectedAttribute)}
              selectedPattern={selectedPattern}
              onPatternClick={this.onPatternClick}
              getLinkToLaunch={this.getLinkToLaunch}
            />
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
