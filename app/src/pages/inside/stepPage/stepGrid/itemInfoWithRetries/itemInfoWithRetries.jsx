import { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ItemInfo } from 'pages/inside/common/itemInfo';
import { RetriesBlock } from './retriesBlock';
import styles from './itemInfoWithRetries.scss';

const cx = classNames.bind(styles);

export class ItemInfoWithRetries extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    value: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func.isRequired,
    refFunction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    expanded: false,
  };

  constructor(props) {
    super(props);

    this.retriesNode = createRef();
  }

  state = {
    retriesVisible: false,
  };

  getRetries = () => [...this.props.value.retries, this.props.value];

  isRetriesVisible = () =>
    this.state.retriesVisible && this.props.value.retries && this.props.value.retries.length > 0;

  showRetries = () => {
    if (!this.props.expanded) {
      this.props.toggleExpand();
    }
    this.setState({ retriesVisible: true }, () => {
      if (this.retriesNode.current) {
        this.retriesNode.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    });
  };

  render() {
    const { refFunction, ...rest } = this.props;
    return (
      <div
        ref={refFunction}
        className={cx('item-info-with-retries', { collapsed: !rest.expanded })}
      >
        <ItemInfo onClickRetries={this.showRetries} {...rest} />
        {this.isRetriesVisible() && (
          <RetriesBlock
            ref={this.retriesNode}
            testItemId={this.props.value.id}
            retries={this.getRetries()}
            collapsed={!rest.expanded}
          />
        )}
      </div>
    );
  }
}
