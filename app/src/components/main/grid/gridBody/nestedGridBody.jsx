import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { GridRow } from './gridRow';
import { columnPropTypes } from '../propTypes';
import styles from './nestedGridBody.scss';

const cx = classNames.bind(styles);
const RowSeparator = () => <div className={cx('row-separator')} />;

class TreeNode extends Component {
  static propTypes = {
    data: PropTypes.object,
    columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
    level: PropTypes.number,
    nestedStepHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  };

  static defaultProps = {
    data: {},
    columns: [],
    level: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
  }

  onToggleHeader = () => {
    this.setState((state) => ({ collapsed: !state.collapsed }));
  };

  render() {
    const { data, nestedStepHeader: NestedStepHeader, level, ...rest } = this.props;
    return data.hasChildren ? (
      <Fragment>
        <NestedStepHeader
          data={data}
          collapsed={this.state.collapsed}
          onToggle={this.onToggleHeader}
          level={level}
          {...rest}
        />
        {!this.state.collapsed && (
          <Fragment>
            {data.children.map((childrenData, i) => (
              <TreeNode
                key={childrenData.id || `${level}_${i}`}
                data={childrenData}
                level={level + 1}
                nestedStepHeader={NestedStepHeader}
                {...rest}
              />
            ))}
            <RowSeparator />
          </Fragment>
        )}
      </Fragment>
    ) : (
      <GridRow value={data} level={level} {...rest} />
    );
  }
}

export const NestedGridBody = ({ data, ...rest }) =>
  data.map((nodeData, i) => (
    <TreeNode key={nodeData.id || `${0}_${i}`} data={nodeData} {...rest} />
  ));

NestedGridBody.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
  data: PropTypes.array,
  nestedStepHeader: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  grouped: PropTypes.bool,
};
NestedGridBody.defaultProps = {
  columns: [],
  data: [],
  nestedStepHeader: null,
  grouped: false,
};
