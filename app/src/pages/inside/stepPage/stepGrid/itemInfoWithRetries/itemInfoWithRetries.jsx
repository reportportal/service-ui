import { Component, Fragment, createRef } from 'react';
import PropTypes from 'prop-types';
import { ItemInfo } from 'pages/inside/common/itemInfo';
import { RetriesBlock } from './retriesBlock';

export class ItemInfoWithRetries extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    value: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func.isRequired,
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
    this.props.expanded &&
    this.state.retriesVisible &&
    this.props.value.retries &&
    this.props.value.retries.length > 0;

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
    return (
      <Fragment>
        <ItemInfo onClickRetries={this.showRetries} {...this.props} />
        {this.isRetriesVisible() && (
          <RetriesBlock
            ref={this.retriesNode}
            testItemId={this.props.value.id}
            retries={this.getRetries()}
          />
        )}
      </Fragment>
    );
  }
}
