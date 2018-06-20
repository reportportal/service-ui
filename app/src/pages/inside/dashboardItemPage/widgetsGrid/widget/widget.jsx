import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { WidgetHeader } from './widgetHeader';
import styles from './widget.scss';

const cx = classNames.bind(styles);

@connect(
  (state, ownProps) => ({
    url: URLS.widget(activeProjectSelector(state), ownProps.widgetId),
  }),
  {
    showModalAction,
  },
)
export class Widget extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    widgetId: PropTypes.string.isRequired,
    showModalAction: PropTypes.func.isRequired,
    switchDraggable: PropTypes.func,
    onDelete: PropTypes.func,
    isModifiable: PropTypes.bool,
  };

  static defaultProps = {
    onDelete: () => {},
    switchDraggable: () => {},
    isModifiable: false,
  };

  constructor(props) {
    super(props);
    this.isDragging = false;

    this.state = {
      loading: true,
      widget: {},
    };
  }

  componentDidMount() {
    this.fetchWidget();
  }

  getContentParams = () => this.state.widget.content_parameters || {};

  getWidgetOptions = () => this.getContentParams().widgetOptions || {};

  fetchWidget = () => {
    this.setState({
      loading: true,
    });
    fetch(this.props.url).then((widget) => {
      this.setState({
        loading: false,
        widget,
      });
    });
  };

  deleteWidget = () => {
    this.props.showModalAction({
      id: 'deleteWidgetModal',
      data: {
        widget: this.state.widget,
        onConfirm: () => this.props.onDelete(this.state.widget.id),
      },
    });
  };

  render() {
    const { widget } = this.state;
    const headerData = {
      owner: widget.owner,
      shared: widget.share,
      name: widget.name,
      description: widget.description,
      type: this.getContentParams().gadget,
      meta: this.getWidgetOptions().viewMode,
    };

    return (
      <div className={cx('widget-container')}>
        <Fragment>
          <div
            className={cx('widget-header', 'draggable-field', {
              modifiable: this.props.isModifiable,
            })}
            onMouseOver={this.onHeaderMouseOver}
            onMouseUp={this.onHeaderMouseUp}
            onMouseDown={this.onHeaderMouseDown}
          >
            <WidgetHeader
              data={headerData}
              onRefresh={this.fetchWidget}
              onDelete={this.deleteWidget}
            />
          </div>
          <div className={cx('widget')}>{this.state.loading && <SpinningPreloader />}</div>
        </Fragment>
      </div>
    );
  }
}
