import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { InputRadio } from 'components/inputs/inputRadio';
import { OwnerBlock } from 'pages/inside/common/itemInfo/ownerBlock';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import styles from './widgetListItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  alreadyAddedWidgetTitle: {
    id: 'WidgetListItem.alreadyAddedWidgetTitle',
    defaultMessage: 'Widget is already added to selected dashboard',
  },
});

@injectIntl
export class WidgetListItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    activeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    activeId: '',
  };

  render() {
    const {
      intl: { formatMessage },
      activeId,
      widget,
      onChange,
    } = this.props;

    return (
      <div
        className={cx('widget-list-item', { 'already-added': widget.alreadyAdded })}
        title={widget.alreadyAdded ? formatMessage(messages.alreadyAddedWidgetTitle) : ''}
      >
        <InputRadio
          value={String(activeId)}
          ownValue={String(widget.id)}
          name="widgetId"
          disabled={widget.alreadyAdded}
          onChange={() => onChange(widget)}
          circleAtTop
        >
          <span className={cx('widget-name')}>{widget.name}</span>
          <span className={cx('widget-type')}>
            {widget.widgetType && formatMessage(widgetTypesMessages[widget.widgetType])}
          </span>
          <OwnerBlock owner={widget.owner} disabled />
        </InputRadio>
      </div>
    );
  }
}
