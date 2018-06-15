import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { WidgetTypeItem } from './widgetTypeItem';
import styles from './widgetTypeSelector.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  heading: {
    id: 'WidgetTypeSelector.heading',
    defaultMessage: 'Choose widget type from the list below',
  },
});

@injectIntl
export class WidgetTypeSelector extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgets: PropTypes.array,
    activeWidgetId: PropTypes.string,
    onChange: PropTypes.func,
    hasErrors: PropTypes.bool,
  };
  static defaultProps = {
    activeWidgetId: '',
    widgets: [],
    onChange: () => {},
    hasErrors: false,
  };

  render() {
    const { intl, widgets, activeWidgetId, onChange, hasErrors } = this.props;
    return (
      <div className={cx('widget-type-selector')}>
        <div className={cx('widget-type-selector-heading', { 'has-errors': hasErrors })}>
          {Parser(intl.formatMessage(messages.heading))}
        </div>
        {widgets.map((widget) => (
          <WidgetTypeItem
            key={widget.id}
            activeWidgetId={activeWidgetId}
            widget={widget}
            onChange={onChange}
          />
        ))}
      </div>
    );
  }
}
