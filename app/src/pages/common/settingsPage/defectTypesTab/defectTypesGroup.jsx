import React, { Component, Fragment } from 'react';
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
export class DefectTypesGroup extends Component {
  static propTypes = {
    group: PropTypes.arrayOf(defectTypeShape).isRequired,
    intl: intlShape.isRequired,
  };

  state = {
    newSubType: false,
  };

  addSubType = () => {
    this.setState({ newSubType: true });
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
          />
        ))}
        {newSubType && <DefectSubType parentType={group[0]} />}
        <div className={cx('defect-type-group-footer')}>
          <GhostButton
            icon={PlusIcon}
            disabled={group.length >= this.MAX_DEFECT_SUBTYPES_COUNT}
            onClick={this.addSubType}
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
