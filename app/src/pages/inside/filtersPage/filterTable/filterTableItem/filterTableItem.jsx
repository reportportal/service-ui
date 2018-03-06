/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { MarkdownViewer } from 'components/main/markdown';
import styles from './filterTableItem.scss';

const cx = classNames.bind(styles);

export const FilterTableItem = (
  { name, description, options, owner, showOnLaunches,
    shared, onClickName, onEdit, onChangeDisplay, onDelete,
    editable,
  },
) => (
  <div className={cx('filter-table-item')}>
    <div className={cx('block', 'name-block')}>
      <span className={cx('name-wrapper')}>
        <span className={cx('name', { link: showOnLaunches })} onClick={onClickName}>
          {name}
        </span>
        {editable ? <div className={cx('pencil-icon')} onClick={onEdit} /> : null}
      </span>
      <div className={cx('description')}>
        {/* TODO replace to markdown viewer */}
        <MarkdownViewer value={description} />
      </div>
    </div>
    <div className={cx('block', 'options-block')}>
      { options }
    </div>
    <div className={cx('block', 'owner-block')}>
      <div className={cx('mobile-label', 'owner-label')}>
        <FormattedMessage id={'FilterTableItem.owner'} defaultMessage={'Owner:'} />
      </div>
      { owner }
    </div>
    <div className={cx('block', 'shared-block')}>
      <div className={cx('mobile-label', 'shared-label')}>
        <FormattedMessage id={'FilterTableItem.shared'} defaultMessage={'Shared:'} />
      </div>
      { shared ? <div className={cx('shared-icon')} onClick={onEdit} /> : null }
    </div>
    <div className={cx('block', 'display-block')}>
      <div className={cx('mobile-label', 'display-label')}>
        <FormattedMessage id={'FilterTableItem.display'} defaultMessage={'Display on launches:'} />
      </div>
      <div className={cx('switcher-wrapper')}>
        <InputSwitcher value={showOnLaunches} onChange={onChangeDisplay}>
          <span className={cx('switcher-label')}>
            {
              showOnLaunches
                ? <FormattedMessage id={'FilterTableItem.showOnLaunchesSwitcherOn'} defaultMessage={'ON'} />
                : <FormattedMessage id={'FilterTableItem.showOnLaunchesSwitcherOff'} defaultMessage={'OFF'} />
            }
          </span>
        </InputSwitcher>
      </div>
      <div className={cx('separator')} />
    </div>
    <div className={cx('block', 'delete-block')}>
      <div className={cx('bin-icon')} onClick={onDelete} />
    </div>
  </div>
);

FilterTableItem.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  options: PropTypes.string,
  owner: PropTypes.string,
  showOnLaunches: PropTypes.bool,
  shared: PropTypes.bool,
  editable: PropTypes.bool,
  onClickName: PropTypes.func,
  onChangeDisplay: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
FilterTableItem.defaultProps = {
  name: '',
  description: '',
  options: '',
  owner: '',
  showOnLaunches: false,
  shared: false,
  editable: false,
  onClickName: () => {},
  onChangeDisplay: () => {},
  onEdit: () => {},
  onDelete: () => {},
};
