import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { CHARTS, NoDataAvailable } from 'components/widgets';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { TABLE_WIDGETS_PREVIEWS } from '../widgets';
import { isWidgetDataAvailable } from '../utils';
import styles from './widgetPreview.scss';

const cx = classNames.bind(styles);

export class WidgetPreview extends PureComponent {
  static propTypes = {
    widgetType: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.widgetContainerRef = createRef();
  }

  getWidgetContent = () => {
    const { data, loading, widgetType } = this.props;

    if (loading) {
      return <SpinningPreloader />;
    }

    if (!isWidgetDataAvailable(data)) {
      return <NoDataAvailable />;
    }

    if (TABLE_WIDGETS_PREVIEWS[widgetType]) {
      return TABLE_WIDGETS_PREVIEWS[widgetType];
    }

    const Chart = CHARTS[widgetType];

    return (
      Chart && (
        <Chart
          isPreview
          widget={data}
          isFullscreen={false}
          container={this.widgetContainerRef.current}
        />
      )
    );
  };

  render = () => (
    <div ref={this.widgetContainerRef} className={cx('widget-preview')}>
      {this.getWidgetContent()}
    </div>
  );
}
