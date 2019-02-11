import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { redirect } from 'redux-first-router';
import { injectIntl, intlShape } from 'react-intl';
import { defectTypesSelector } from 'controllers/project';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import commonLegendStyles from '../common/legend/legend.scss';
import chartStyles from './launchExecutionAndIssueStatistics.scss';
import { getItemColor, getItemName, getItemNameConfig } from '../common/utils';

const commonCx = classNames.bind(commonLegendStyles);
const chartCx = classNames.bind(chartStyles);

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
  }),
  {
    redirect,
  },
)
export class Legend extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    items: PropTypes.array,
    defectTypes: PropTypes.object.isRequired,
    project: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
  };

  static defaultProps = {
    items: [],
    onClick: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
  };

  state = {
    uncheckedIds: [],
  };

  calculateItemClassName = (id) =>
    this.state.uncheckedIds.indexOf(id) !== -1 ? commonCx('unchecked') : null;

  handleClick = (id) => {
    this.toggleUnchecked(id);
    this.props.onClick(id);
  };

  toggleUnchecked = (id) => {
    const [...idList] = this.state.uncheckedIds;
    if (idList.includes(id)) {
      idList.splice(idList.indexOf(id), 1);
    } else {
      idList.push(id);
    }

    this.setState({
      uncheckedIds: idList,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      items,
      onMouseOut,
    } = this.props;
    const legendContainerClass = `${commonCx('legend')} ${chartCx('legend-title')}`;

    return (
      <div className={legendContainerClass}>
        {items.map((item) => (
          <span
            key={item.name}
            data-id={item.id}
            className={`${commonCx('legend-item')} ${this.calculateItemClassName(item.id)}`}
            onClick={() => this.handleClick(item.id)}
            onMouseOver={() => this.props.onMouseOver(item.id)}
            onMouseOut={onMouseOut}
          >
            <span
              className={commonCx('color-mark')}
              style={{
                backgroundColor: getItemColor(getItemNameConfig(item.name), this.props.defectTypes),
              }}
            />
            <span className={commonCx('item-name')}>
              {getItemName(getItemNameConfig(item.id), this.props.defectTypes, formatMessage)}
            </span>
          </span>
        ))}
      </div>
    );
  }
}
