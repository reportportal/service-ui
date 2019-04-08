import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';

import { Input } from 'components/inputs/input';
import { ColorPicker } from 'components/main/colorPicker';
import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import CircleCheckIcon from 'common/img/circle-check-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { updateDefectSubTypeAction, addDefectSubTypeAction } from 'controllers/project';

import { defectTypeShape } from './defectTypeShape';
import { messages } from './defectTypesMessages';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

@connect(null, {
  updateDefectSubTypeAction,
  addDefectSubTypeAction,
})
@injectIntl
export class DefectSubTypeForm extends PureComponent {
  static propTypes = {
    data: defectTypeShape,
    parentType: defectTypeShape.isRequired,
    closeNewSubTypeForm: PropTypes.func.isRequired,
    stopEditing: PropTypes.func.isRequired,
    updateDefectSubTypeAction: PropTypes.func.isRequired,
    addDefectSubTypeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  state = { ...this.props.data };

  updateLongName = (e) => this.setState({ longName: e.target.value });

  updateShortName = (e) => this.setState({ shortName: e.target.value });

  updateColor = ({ hex }) => this.setState({ color: hex });

  updateDefectSubType = () => {
    if (
      this.props.data.longName !== this.state.longName ||
      this.props.data.shortName !== this.state.shortName ||
      this.props.data.color !== this.state.color
    ) {
      this.props.updateDefectSubTypeAction(this.state);
    }
    this.props.stopEditing();
  };

  addDefectSubType = () => {
    this.props.addDefectSubTypeAction({
      ...this.state,
      typeRef: this.props.parentType.typeRef,
      color: this.state.color || this.props.parentType.color,
    });
    this.props.closeNewSubTypeForm();
  };

  render() {
    const { parentType, closeNewSubTypeForm, intl } = this.props;

    const { id, color, longName, shortName } = this.state;

    return (
      <Fragment>
        <div className={cx('name-cell')}>
          <Input
            placeholder={intl.formatMessage(messages.defectNameCol)}
            value={longName || ''}
            onChange={this.updateLongName}
          />
        </div>
        <div className={cx('abbr-cell')}>
          <Input
            placeholder={intl.formatMessage(messages.abbreviationCol)}
            value={shortName || ''}
            onChange={this.updateShortName}
          />
        </div>
        <div className={cx('color-cell')}>
          <ColorPicker color={color || parentType.color} onChangeComplete={this.updateColor} />
        </div>
        <div className={cx('buttons-cell')}>
          <button
            className={cx('action-button', 'confirm-button')}
            aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.CONFIRM)}
            title={intl.formatMessage(COMMON_LOCALE_KEYS.CONFIRM)}
            onClick={id ? this.updateDefectSubType : this.addDefectSubType}
          >
            {Parser(CircleCheckIcon)}
          </button>
          <button
            className={cx('action-button', 'delete-button')}
            aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
            title={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
            onClick={closeNewSubTypeForm}
          >
            {Parser(CircleCrossIcon)}
          </button>
        </div>
      </Fragment>
    );
  }
}
