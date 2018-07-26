import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { touch } from 'redux-form';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './widgetTypeSelector.scss';
import { WidgetTypeItem } from './widgetTypeItem';
import { WIDGET_WIZARD_FORM } from '../../constants';

const cx = classNames.bind(styles);
const messages = defineMessages({
  heading: {
    id: 'WidgetTypeSelector.heading',
    defaultMessage: 'Choose widget type from the list below',
  },
});

@injectIntl
@connect(
  null,
  {
    touchField: () => touch(WIDGET_WIZARD_FORM, 'widgetType'),
  },
)
export class WidgetTypeSelector extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.string,
    widgets: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
    touchField: PropTypes.func.isRequired,
  };

  static defaultProps = {
    value: '',
    error: '',
    widgets: [],
  };

  handleWidgetSelect = (e) => {
    this.props.touchField();
    this.props.onChange(e.target.value);
  };

  render() {
    const { intl, widgets, error, touched, value } = this.props;

    return (
      <div className={cx('widget-type-selector')}>
        <div className={cx('widget-type-selector-heading', { 'has-errors': error && touched })}>
          {Parser(intl.formatMessage(messages.heading))}
        </div>

        {widgets.map((widget) => (
          <WidgetTypeItem
            key={widget.id}
            activeWidgetId={value}
            widget={widget}
            onChange={this.handleWidgetSelect}
          />
        ))}
      </div>
    );
  }
}
