import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { NoDataAvailable } from 'components/widgets';
import { PatternGrid } from './patternGrid';
import { SecondLevelPanel } from './secondLevelPanel';
import styles from './mostPopularPatterns.scss';

const PATTERN_FILTER_PARAM = 'patternTemplateName';
const cx = classNames.bind(styles);

export class MostPopularPatterns extends Component {
  static propTypes = {
    widget: PropTypes.object,
    fetchWidget: PropTypes.func,
    queryParameters: PropTypes.object,
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
    queryParameters: {},
    clearQueryParams: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedAttribute: this.getDefaultAttribute(props.widget.content.result),
      selectedPattern: props.queryParameters.patternTemplateName,
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

  onBackClick = () => {
    this.props.clearQueryParams(() => {
      this.setState({
        selectedPattern: null,
      });
    });
  };

  onPatternClick = (pattern) => {
    this.props.fetchWidget({ [PATTERN_FILTER_PARAM]: pattern }).then(() => {
      this.setState({
        selectedPattern: pattern,
      });
    });
  };

  onChangeAttribute = (newAttribute) =>
    this.setState({
      selectedAttribute: newAttribute,
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
        selectedPattern: null,
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
    const { selectedAttribute, selectedPattern } = this.state;

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
        {selectedPattern && (
          <SecondLevelPanel patternName={selectedPattern} onBackClick={this.onBackClick} />
        )}
        <div className={cx('patterns-grid')}>
          <ScrollWrapper>
            <PatternGrid
              widget={this.props.widget}
              selectedPattern={selectedPattern}
              selectedAttribute={selectedAttribute}
              onPatternClick={this.onPatternClick}
            />
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
