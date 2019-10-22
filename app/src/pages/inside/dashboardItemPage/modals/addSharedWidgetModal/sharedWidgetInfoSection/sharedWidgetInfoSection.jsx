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

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { WidgetPreview } from '../../common/widgetPreview';
import styles from './sharedWidgetInfoSection.scss';

const cx = classNames.bind(styles);

export class SharedWidgetInfoSection extends PureComponent {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    selectedWidget: PropTypes.object,
  };

  static defaultProps = {
    selectedWidget: null,
  };

  state = {
    loading: false,
    widgetType: '',
    widgetData: {},
  };

  componentDidMount() {
    this.props.selectedWidget && this.fetchWidget();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.selectedWidget || prevProps.selectedWidget.id !== this.props.selectedWidget.id) {
      this.fetchWidget();
    }
  }

  fetchWidget = () => {
    this.setState({
      loading: true,
      widgetType: this.props.selectedWidget.widgetType,
    });
    fetch(URLS.widget(this.props.projectId, this.props.selectedWidget.id))
      .then((widgetData) => {
        this.setState({
          loading: false,
          widgetData,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const { selectedWidget } = this.props;
    const { loading, widgetType, widgetData } = this.state;

    return (
      <div className={cx('shared-widget-info-section')}>
        {selectedWidget && (
          <Fragment>
            <h2 className={cx('widget-name')}>{selectedWidget.name}</h2>
            <WidgetPreview widgetType={widgetType} data={widgetData} loading={loading} />
          </Fragment>
        )}
      </div>
    );
  }
}
