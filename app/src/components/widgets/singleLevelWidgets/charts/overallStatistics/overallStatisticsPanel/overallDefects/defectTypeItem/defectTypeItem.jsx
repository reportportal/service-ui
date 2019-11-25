/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { defectTypesSelector } from 'controllers/project';
import { getItemColor, getItemName, getDefectTypeLocators } from 'components/widgets/common/utils';
import styles from './defectTypeItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
export class DefectTypeItem extends React.Component {
  static propTypes = {
    defectTypes: PropTypes.object.isRequired,
    itemName: PropTypes.string.isRequired,
    nameConfig: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired,
    onChartClick: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };
  render() {
    const {
      intl: { formatMessage },
      itemName,
      nameConfig,
      defectTypes,
      value,
      onChartClick,
    } = this.props;
    const defectName = getItemName({ itemName, defectTypes, formatMessage });
    const bgColor = getItemColor(itemName, defectTypes);
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

    return (
      <div className={cx('defect')}>
        <div className={cx('amount')}>{value}</div>

        <div className={cx('label')} onClick={() => onChartClick(defectLocators)}>
          <div style={{ backgroundColor: bgColor }} className={cx('marker')} />
          {defectName}
        </div>
      </div>
    );
  }
}
