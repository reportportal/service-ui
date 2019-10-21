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
import classNames from 'classnames/bind';
import { orderedDefectFieldsSelector } from 'controllers/project';
import { TotalStatistics } from './totalStatistics';
import { OverallDefects } from './overallDefects';
import styles from './overallStatisticsPanel.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  orderedContentFields: orderedDefectFieldsSelector(state),
}))
export class OverallStatisticsPanel extends React.PureComponent {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    orderedContentFields: PropTypes.array.isRequired,
    isPreview: PropTypes.bool,
  };

  static defaultProps = {
    isPreview: false,
  };

  getOrderedValues = () => {
    const { widget, orderedContentFields } = this.props;
    const values = widget.content.result[0].values;

    return orderedContentFields
      .filter((key) => widget.contentParameters.contentFields.indexOf(key) !== -1)
      .map((key) => ({ key, value: values[key] || 0 }));
  };

  getTotals = () => {
    const { widget } = this.props;
    const values = widget.content.result[0].values;
    const fields = widget.contentParameters.contentFields.filter(
      (field) => field.indexOf('executions') !== -1,
    );
    const newValues = {};

    fields.forEach((field) => {
      newValues[field] = values[field] || 0;
    });

    return newValues;
  };

  render() {
    const { isPreview } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('total')}>
          <TotalStatistics values={this.getTotals()} />
        </div>

        {!isPreview && (
          <div className={cx('defects')}>
            <OverallDefects valuesArray={this.getOrderedValues()} />
          </div>
        )}
      </div>
    );
  }
}
