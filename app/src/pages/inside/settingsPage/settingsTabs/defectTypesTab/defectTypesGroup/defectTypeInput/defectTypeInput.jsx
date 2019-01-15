import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input/index';
import { InputColorPicker } from 'components/inputs/inputColorPicker/index';
import 'c3/c3.css';
import { Icon } from '../../../../../../../components/main/icon/index';

@connect(() => ({
  colorChoicerToggle: false,
}))
@reduxForm({
  form: 'defectTypesInput',
})
@injectIntl
export class DefectTypeInput extends Component {
  static propTypes = {
    longName: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    longNamePlaceholder: PropTypes.string.isRequired,
    shortNamePlaceholder: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func,
    onFormSubmit: PropTypes.func.isRequired,
    onDestroy: PropTypes.func.isRequired,
    initialize: PropTypes.func,
    intl: intlShape,
    cx: PropTypes.func.isRequired,
    color: PropTypes.string,
    newColor: PropTypes.string,
    colorChange: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    handleSubmit: () => {},
    initialize: () => {},
    color: '#f00',
    newColor: '#',
    colorChange: () => {},
  };

  componentWillMount() {
    this.setState({
      colorChoicerToggle: false,
    });
  }

  componentDidMount() {
    this.props.initialize({
      shortName: this.props.shortName,
      longName: this.props.longName,
      color: this.props.color,
      colorChange: this.props.colorChange,
      newColor: this.props.newColor,
    });
  }

  onSubmitHandler = (eventData) => {
    this.props.handleSubmit(this.props.onFormSubmit)(eventData);
    this.props.onDestroy();
  };

  showColorChoicer = () => {
    this.setState({
      colorChoicerToggle: !this.state.colorChoicerToggle,
    });
  };

  render() {
    const { cx } = this.props;
    return (
      <form>
        <div className={cx('table_row', 'defect-types-input')}>
          <div className={cx('table_column', 'table_column--defect-name')}>
            <div className={cx('defect-types-input-name')}>
              <FieldProvider name="longName">
                <Input placeholder={this.props.longNamePlaceholder} />
              </FieldProvider>
            </div>
          </div>
          <div className={cx('table_column', 'table_column--shortName')}>
            <div className={cx('defect-types-input-shortName')}>
              <FieldProvider name="shortName">
                <Input placeholder={this.props.shortNamePlaceholder} />
              </FieldProvider>
            </div>
          </div>
          <div className={cx('table_column', 'table_column--color')}>
            <div className={cx('color-preview-input')} onClick={this.showColorChoicer}>
              <span
                className={cx('color-spot', 'table_column--color-spot')}
                style={{ backgroundColor: this.props.newColor }}
              />
              <Icon
                type={this.state.colorChoicerToggle ? 'icon-triangle-down' : 'icon-triangle-up'}
              />
            </div>
            {this.state.colorChoicerToggle && (
              <div className={cx('colorPickerContainer')}>
                <InputColorPicker
                  color={this.props.newColor}
                  colorChange={this.props.colorChange}
                />
              </div>
            )}
            <span className={cx('defect-types-input_button-done')}>
              <Icon type="icon-check-circle" onClick={this.onSubmitHandler} />
            </span>
            <span className={cx('defect-types-input_button-close')}>
              <Icon type="icon-close-circle" onClick={this.props.onDestroy} />
            </span>
          </div>
        </div>
      </form>
    );
  }
}
