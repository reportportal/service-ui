import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/index';
import { GhostButton } from 'components/buttons/ghostButton/index';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { projectConfigSelector, defectTypesSelector } from 'controllers/project/index';
import { activeProjectSelector } from 'controllers/user/index';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification/index';
import { showModalAction, hideModalAction } from 'controllers/modal/index';
import { deleteDefectTypeAction } from 'controllers/settings/index';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { MAX_SUB_TYPES } from 'common/constants/settingsTabs';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import { Messages } from './defectTypesGroupMessages';
import { Icon } from '../../../../../../components/main/icon/index';
import { DefectTypeInput } from './defectTypeInput';
import { defectTypeDonutChartConfiguration } from './defectTypeChartConfig';

@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    subTypes: defectTypesSelector(state),
    config: projectConfigSelector(state),
  }),
  {
    showNotification,
    showModalAction,
    hideModalAction,
    deleteDefectTypeAction,
  },
)
@injectIntl
export class DefectTypesGroup extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showNotification: PropTypes.func,
    showModalAction: PropTypes.func,
    hideModalAction: PropTypes.func,
    handleSubmit: PropTypes.func,
    projectId: PropTypes.string.isRequired,
    initialize: PropTypes.func,
    title: PropTypes.string.isRequired,
    group: PropTypes.string.isRequired,
    subType: PropTypes.array.isRequired,
    cx: PropTypes.func.isRequired,
  };

  static defaultProps = {
    intl: {},
    showNotification: () => {},
    showModalAction: () => {},
    hideModalAction: () => {},
    projectId: '',
    fetchProjectAction: () => {},
    initialize: () => {},
    handleSubmit: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      defectTypes: this.props.subType,
      isInEdit: [],
      isNewInEdit: false,
      newColor: this.props.subType[0].color,
    };
  }

  onDeleteHandler = (defectType) => (data) => {
    const { formatMessage } = this.props.intl;
    this.props.showModalAction({
      id: 'defectTypeDeleteModal',
      data: {
        title: formatMessage(Messages.deleteModalTitle),
        message: formatMessage(Messages.deleteModalConfirmationText, {
          defectType: defectType.longName,
          defaultDefectGroup: formatMessage(Messages[defectType.typeRef.toLowerCase()]),
        }),
        submitText: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        onSubmit: this.deleteDefectType(defectType),
        hideModalAction: this.props.hideModalAction,
        data,
      },
    });
  };

  setNewColor = (color) => {
    if (color !== this.state.newColor) {
      this.setState({ newColor: color });
    }
  };

  setNewEditMode = (editMode) => this.setState({ isNewInEdit: editMode });

  setDefectTypeEditMode = (defectType) => (editMode) =>
    this.setState({
      newColor: defectType.color,
      isInEdit: editMode
        ? this.state.isInEdit.concat(defectType.locator)
        : this.state.isInEdit.filter((locator) => locator !== defectType.locator),
    });

  MAX_DEFECT_SUBTYPES_SIZE = 15;

  showSuccessNotification = (message) =>
    this.props.showNotification({
      message: this.props.intl.formatMessage(message),
      type: NOTIFICATION_TYPES.SUCCESS,
    });

  showErrorNotification = (message) =>
    this.props.showNotification({
      message: this.props.intl.formatMessage(message),
      type: NOTIFICATION_TYPES.ERROR,
    });

  deleteDefectType = (deletedDefectType) => () =>
    this.deleteDefectTypeRequest(deletedDefectType, (deletedLocator) => {
      this.setState({
        defectTypes: this.state.defectTypes.filter(
          (defectType) => defectType.locator !== deletedLocator,
        ),
      });
      this.setDefectTypeEditMode(deletedDefectType, false);
    });

  addDefectType = (group, newDefectType) => {
    this.createDefectTypeRequest(
      { color: this.state.defectTypes[0].color, ...newDefectType, typeRef: group },
      (subTypeWithLocator) =>
        this.setState({
          defectTypes: this.state.defectTypes.concat(subTypeWithLocator),
        }),
    );
  };

  changeDefectType = (group, changedDefectType) => {
    const { shortName, longName } = changedDefectType;
    this.changeDefectTypeRequest(
      {
        ids: [
          {
            id: changedDefectType.id,
            locator: changedDefectType.locator,
            color: this.state.newColor,
            shortName,
            longName,
            typeRef: group,
          },
        ],
      },
      () =>
        this.setState({
          defectTypes: this.state.defectTypes.map((defectType) =>
            Object.assign(
              {},
              defectType.locator === changedDefectType.locator ? changedDefectType : defectType,
            ),
          ),
        }),
    );
  };

  deleteDefectTypeRequest = (data, setState) => {
    fetch(URLS.defectTypesDelete(this.props.projectId, data.id), { method: 'delete' })
      .then(() => {
        setState(data.locator);
        this.showSuccessNotification(Messages.deleteSuccessNotification);
      })
      .catch(() => this.showErrorNotification(Messages.deleteErrorNotification));
  };

  createDefectTypeRequest = (data, setState) => {
    const newData = data;
    newData.color = this.state.newColor;
    fetch(URLS.defectTypesCreate(this.props.projectId), { method: 'post', newData })
      .then((response) => {
        setState({ locator: response.locator, id: response.id, ...newData });
        this.showSuccessNotification(Messages.createSuccessNotification);
      })
      .catch(() => this.showErrorNotification(Messages.createErrorNotification));
  };

  changeDefectTypeRequest = (data, setState) => {
    const newData = data;
    newData.ids[0].color = this.state.newColor;
    fetch(URLS.defectTypesCreate(this.props.projectId), { method: 'put', newData })
      .then((response) => {
        setState({ id: response.id, ...newData });
        this.showSuccessNotification(Messages.updateSuccessNotification);
      })
      .catch(() => this.showErrorNotification(Messages.updateErrorNotification));
  };

  DefectTypesRow = ({ cx, subType, isImmutable, onDelete, setEditMode, locatorText }) => (
    <div className={cx('table_row')}>
      <div className={cx('table_column', 'table_column--defect-name')}>
        <div className={cx('defect-types-badge')}>
          <span
            className={cx('color-spot', 'defect-types-badge_spot')}
            style={{ backgroundColor: subType.color }}
          />
          {subType.longName}
        </div>
        <div className={cx('locator-tooltip-wrapper')}>
          <div className={cx('locator-tooltip-content')}>
            <span>{locatorText} </span>
            <strong className={cx('locator')}>{subType.locator}</strong>
          </div>
        </div>
      </div>
      <div className={cx('table_column', 'table_column--shortName')}>{subType.shortName}</div>
      <div className={cx('table_column', 'table_column--color')}>
        <span
          className={cx('color-spot', 'table_column--color-spot')}
          style={{ backgroundColor: subType.color }}
        />
        {!isImmutable && (
          <span className={cx('defect-types-input_button-edit')}>
            <Icon type="icon-pencil" onClick={() => setEditMode(true)} />
          </span>
        )}
        {!isImmutable && (
          <span className={cx('defect-types-input_button-delete')}>
            <Icon type="icon-delete" onClick={onDelete} />
          </span>
        )}
      </div>
    </div>
  );

  AddDefectTypeButton = ({ cx, setEditMode, disabled, btnText, defectTypesLeftText }) => (
    <div>
      <div className={cx('button-add')}>
        <GhostButton disabled={disabled} icon={PlusIcon} onClick={() => setEditMode(true)}>
          {btnText}
        </GhostButton>
      </div>
      <div className={cx('type-slot-left')}>{defectTypesLeftText}</div>
    </div>
  );

  defectTypesChartData = (subTypesGroup) => ({
    columns: subTypesGroup.map((subtype) => [subtype.locator, 100]),
    colors: subTypesGroup.reduce((acc, subtype) => {
      acc[subtype.locator] = subtype.color;
      return acc;
    }, {}),
    type: 'donut',
  });

  render() {
    const { group, title, cx } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <section className={cx('table_section')}>
        <h1 className={cx('table_section-header')}>{title}</h1>

        <div className={cx('table_section-body')}>
          {this.state.defectTypes && (
            <Fragment>
              <div className={cx('table_section-data')}>
                {this.state.defectTypes.map((defectType, index) => (
                  <Fragment key={defectType.locator}>
                    {!this.state.isInEdit.includes(defectType.locator) ? (
                      <this.DefectTypesRow
                        cx={cx}
                        subType={defectType}
                        isImmutable={index === 0}
                        onDelete={this.onDeleteHandler(defectType)}
                        setEditMode={this.setDefectTypeEditMode(defectType)}
                        locatorText={formatMessage(Messages.locator)}
                      />
                    ) : (
                      <DefectTypeInput
                        cx={cx}
                        form={defectType.locator}
                        longName={defectType.longName}
                        shortName={defectType.shortName}
                        longNamePlaceholder={formatMessage(Messages.longNamePlaceholder)}
                        shortNamePlaceholder={formatMessage(Messages.shortNamePlaceholder)}
                        onFormSubmit={(editedFields) =>
                          this.changeDefectType(group, Object.assign({}, defectType, editedFields))
                        }
                        colorChange={this.setNewColor}
                        newColor={this.state.newColor}
                        onDestroy={() => this.setDefectTypeEditMode(defectType)(false)}
                        formatMessage={formatMessage}
                      />
                    )}
                  </Fragment>
                ))}
              </div>
              <div className={cx('table_section-chart')}>
                <C3Chart
                  data={this.defectTypesChartData(this.state.defectTypes)}
                  {...defectTypeDonutChartConfiguration}
                />
              </div>
              {this.state.isNewInEdit && (
                <DefectTypeInput
                  cx={cx}
                  color={this.state.defectTypes[0].color}
                  form={group}
                  longName=""
                  shortName=""
                  longNamePlaceholder={formatMessage(Messages.longNamePlaceholder)}
                  shortNamePlaceholder={formatMessage(Messages.shortNamePlaceholder)}
                  onFormSubmit={(newDefectType) => this.addDefectType(group, newDefectType)}
                  colorChange={this.setNewColor}
                  newColor={this.state.newColor}
                  onDestroy={() => this.setNewEditMode(false)}
                />
              )}
            </Fragment>
          )}

          <this.AddDefectTypeButton
            cx={cx}
            setEditMode={this.setNewEditMode}
            disabled={this.state.defectTypes.length > this.MAX_DEFECT_SUBTYPES_SIZE}
            btnText={formatMessage(Messages.addBtn)}
            defectTypesLeftText={
              this.state.defectTypes.length < MAX_SUB_TYPES
                ? formatMessage(Messages.addNewDefect, {
                    subTypesLeft: MAX_SUB_TYPES - this.state.defectTypes.length,
                  })
                : formatMessage(Messages.noMoreDefectSlot, { maxSubTypes: MAX_SUB_TYPES })
            }
          />
        </div>
      </section>
    );
  }
}
