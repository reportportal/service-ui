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

import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEqual from 'fast-deep-equal';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { getQueryNamespace, TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { NoDataAvailable } from 'components/widgets';
import { getDefaultTestItemLinkParams } from 'components/widgets/common/utils';
import { PatternGrid } from './patternGrid';
import styles from './mostPopularPatterns.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    project: activeProjectSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class MostPopularPatterns extends Component {
  static propTypes = {
    project: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
    widget: PropTypes.object,
    fetchWidget: PropTypes.func,
    clearQueryParams: PropTypes.func,
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
    clearQueryParams: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedAttribute: this.getDefaultAttribute(props.widget.content.result),
    };
  }

  componentDidUpdate(prevProps) {
    if (
      !isEqual(prevProps.widget.contentParameters, this.props.widget.contentParameters) ||
      !isEqual(prevProps.widget.appliedFilters, this.props.widget.appliedFilters)
    ) {
      this.resetWidget();
    }
  }

  onPatternClick = (patternName) => {
    const { widget, project } = this.props;
    const { selectedAttribute } = this.state;

    const launchesLimit = widget.contentParameters.itemsCount;
    const compositeAttribute = `${widget.contentParameters.widgetOptions.attributeKey}:${selectedAttribute}`;
    const defaultNavigationParams = getDefaultTestItemLinkParams(
      project,
      widget.appliedFilters[0].id,
      TEST_ITEMS_TYPE_LIST,
    );
    const metaParams = this.getNavigationMetaParams(
      patternName,
      compositeAttribute,
      launchesLimit,
      widget.contentParameters.widgetOptions.latest,
    );

    this.props.navigate(Object.assign(defaultNavigationParams, metaParams));
  };

  onChangeAttribute = (newAttribute) =>
    this.setState({
      selectedAttribute: newAttribute,
    });

  getNavigationMetaParams = (patternName, compositeAttribute, launchesLimit, isLatest) => ({
    meta: {
      query: createNamespacedQuery(
        {
          'filter.eq.hasStats': true,
          'filter.eq.hasChildren': false,
          'filter.any.patternName': patternName,
          'filter.has.compositeAttribute': compositeAttribute,
          isLatest,
          launchesLimit,
        },
        getQueryNamespace(0),
      ),
    },
  });

  getAttributes = (data = []) =>
    data
      .map((group) => ({
        label: group.attributeValue,
        value: group.attributeValue,
      }))
      .reverse();

  getDefaultAttribute = (data = []) => (data.length ? this.getAttributes(data)[0].value : null);

  resetWidget = () => {
    this.props.clearQueryParams(() => {
      this.setState({
        selectedAttribute: this.getDefaultAttribute(this.props.widget.content.result),
      });
    });
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
    const { selectedAttribute } = this.state;

    if (!result || !result.length) return <NoDataAvailable />;

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
        <div className={cx('patterns-grid')}>
          <ScrollWrapper>
            <PatternGrid
              widget={this.props.widget}
              selectedAttribute={selectedAttribute}
              onPatternClick={this.onPatternClick}
            />
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
