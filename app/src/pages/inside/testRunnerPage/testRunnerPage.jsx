import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import ReactObserver from 'react-event-observer';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import styles from './testRunnerPage.scss';

const cx = classNames.bind(styles);

@track({ page: 'testrunner' })
export class TestRunnerPage extends Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.observer = ReactObserver();
    this.state = {
      versionNumber: '1.0',
      packageFile: 'value1',
    };
  }

  onVersionNumberChange = (e) => {
    this.setState({ versionNumber: e.target.value });
  };

  onPackageFileChange = (e) => {
    this.setState({ packageFile: e.target.value });
  };

  runTest = () => {
    const { versionNumber, packageFile } = this.state;

    const url = `http:///job//buildWithParameters/packageType=${packageFile}&jdkVersion=${versionNumber}&debug=true`;

    fetch(url);
  };

  render() {
    const { versionNumber, packageFile } = this.state;

    return (
      <PageLayout title="Test Page">
        <PageSection>
          <div className={cx('test-runner')}>
            <h1>Test Runner Page</h1>

            <div className={cx('form-row')}>
              <span>APP_PKG_VERSION:</span>
              <select
                id="selectVersionNumber"
                value={versionNumber}
                onChange={this.onVersionNumberChange}
              >
                <option value="">Select&hellip;</option>
                <option value="1.0">Version 1.0</option>
              </select>
            </div>

            <div className={cx('form-row')}>
              <span>APP_PACKAGE.tgz:</span>
              <select value={packageFile} onChange={this.onPackageFileChange}>
                <option value="">Select&hellip;</option>
                <option value="value1">Hello 1</option>
                <option value="value2">Hello 2</option>
              </select>
            </div>

            <button className={cx('form-button')} type="button" onClick={this.runTest}>
              Run Test
            </button>
          </div>
        </PageSection>
      </PageLayout>
    );
  }
}
