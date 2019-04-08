import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';

import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';

import { DefectSubType } from './defectSubType';
import { defectTypeShape } from './defectTypeShape';
import { messages } from './defectTypesMessages';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

@injectIntl
export class DefectTypesGroup extends PureComponent {
  static propTypes = {
    group: PropTypes.arrayOf(defectTypeShape).isRequired,
    intl: intlShape.isRequired,
  };

  state = {
    newSubType: false,
  };

  addNewSubType = () => {
    this.setState({ newSubType: true });
  };

  closeNewSubTypeForm = () => {
    this.setState({ newSubType: false });
  };

  MAX_DEFECT_SUBTYPES_COUNT = 15;

  render() {
    const { group, intl } = this.props;
    const { newSubType } = this.state;

    return (
      <Fragment>
        {group.map((subType, i) => (
          <DefectSubType
            key={subType.id}
            data={subType}
            parentType={group[0]}
            group={i === 0 ? group : null}
            closeNewSubTypeForm={this.closeNewSubTypeForm}
          />
        ))}
        {newSubType && (
          <DefectSubType parentType={group[0]} closeNewSubTypeForm={this.closeNewSubTypeForm} />
        )}
        <div className={cx('defect-type-group-footer')}>
          <GhostButton
            icon={PlusIcon}
            disabled={group.length >= this.MAX_DEFECT_SUBTYPES_COUNT}
            onClick={this.addNewSubType}
          >
            {intl.formatMessage(messages.addDefectType)}
          </GhostButton>

          <div className={cx('defect-type-count-msg')}>
            {group.length < this.MAX_DEFECT_SUBTYPES_COUNT
              ? `${this.MAX_DEFECT_SUBTYPES_COUNT - group.length} ${intl.formatMessage(
                  messages.subtypesCanBeAdded,
                )}`
              : intl.formatMessage(messages.allSubtypesAreAdded, {
                  count: this.MAX_DEFECT_SUBTYPES_COUNT,
                })}
          </div>
        </div>
      </Fragment>
    );
  }
}
