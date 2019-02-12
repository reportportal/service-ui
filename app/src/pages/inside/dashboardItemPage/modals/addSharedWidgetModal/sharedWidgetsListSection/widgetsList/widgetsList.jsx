import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './widgetsList.scss';
import { WidgetListItem } from './widgetListItem';

const cx = classNames.bind(styles);

export const WidgetsList = ({
  activeId,
  widgets,
  loading,
  onChange,
  onLazyLoad,
  noItemsMessage,
}) => (
  <div className={cx('widgets-list')}>
    <ScrollWrapper onLazyLoad={onLazyLoad}>
      {widgets.map((item) => (
        <WidgetListItem key={item.id} widget={item} activeId={activeId} onChange={onChange} />
      ))}
      {loading && <SpinningPreloader />}
      {!widgets.length && !loading && <NoItemMessage message={noItemsMessage} />}
    </ScrollWrapper>
  </div>
);

WidgetsList.propTypes = {
  activeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  widgets: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onChange: PropTypes.func,
  onLazyLoad: PropTypes.func,
  noItemsMessage: PropTypes.string,
};

WidgetsList.defaultProps = {
  activeId: '',
  loading: false,
  onChange: () => {},
  onLazyLoad: null,
  noItemsMessage: '',
};
