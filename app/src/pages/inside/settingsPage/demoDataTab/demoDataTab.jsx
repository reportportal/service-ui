import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'components/inputs/input';
import styles from './demoDataTab.scss';
import warningSign from './img/ic-warning.svg';

export class DemoDataTab extends Component {
  static propTypes = {
    postfix: PropTypes.string.isRequired,
    postfixChanged: PropTypes.func.isRequired,
    generateDemo: PropTypes.func.isRequired,
  };

  handleOnChange = (event) => {
    this.props.postfixChanged(event.target.value);
  };

  handleClick = () => {
    this.props.generateDemo();
  };

  render() {
    return (
      <div className={styles.demoDataTabContainer}>
        <p className={styles.youCanGenerateDat}>You can generate data only on desktop view.</p>
        <h5 className={styles.theSystemWillGene}>
          THE SYSTEM WILL GENERATE THE FOLLOWING DEMO DATA:
        </h5>
        <ul>
          <li>
            <span className={styles.dot} />10 launches
          </li>
          <li>
            <span className={styles.dot} />1 dashboard with 9 widgets
          </li>
          <li>
            <span className={styles.dot} />1 filter
          </li>
        </ul>
        <p className={styles.postfixWillBeAdd}>
          Postfix will be added to the demo dashboard, widgets, filter name
        </p>
        <div className={styles.inputEnterPostfix}>
          <Input
            placeholder="Enter Postfix"
            value={this.props.postfix}
            onChange={this.handleOnChange}
          />
        </div>
        <button className={styles.button} onClick={this.handleClick}>
          <span className={styles.generateDemoData}>Generate Demo Data</span>
        </button>
        <div className={styles.warningMessage}>
          <img src={warningSign} className={styles.warningSign} alt="red exclamation sign" />
          <p className={styles.warningText}>Warning</p>
        </div>
        <p className={styles.youWillHaveToRemove}>
          You will have to remove the demo data manually.
        </p>
      </div>
    );
  }
}
