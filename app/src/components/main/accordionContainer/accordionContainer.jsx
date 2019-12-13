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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './accordionContainer.scss';

const cx = classNames.bind(styles);

export class AccordionContainer extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    maxHeight: PropTypes.number.isRequired,
  };

  state = {
    expanded: false,
    withAccordion: false,
  };

  componentDidMount() {
    this.handleAccordion();
  }

  componentDidUpdate() {
    this.handleAccordion();
  }

  setupRef = (el) => {
    this.element = el;
  };

  setupAccordion = () => {
    this.setState({ withAccordion: true });
    this.element.style.maxHeight = `${this.props.maxHeight}px`;
  };

  removeAccordion = () => {
    this.setState({ withAccordion: false });
    this.element.style.maxHeight = null;
  };

  handleAccordion = () => {
    if (!this.element) {
      return;
    }
    if (this.element.offsetHeight > this.props.maxHeight) {
      !this.state.withAccordion && this.setupAccordion();
    } else if (this.element.offsetHeight < this.props.maxHeight) {
      this.state.withAccordion && this.removeAccordion();
    }
  };

  toggleAccordion = () => {
    this.setState({ expanded: !this.state.expanded });
    this.element.style.maxHeight = this.state.expanded ? `${this.props.maxHeight}px` : null;
  };

  render() {
    const elementClass = this.state.withAccordion ? cx('overflow') : null;
    return (
      <div className={cx('accordion-container')}>
        {this.props.children({ setupRef: this.setupRef, className: elementClass })}
        {this.state.withAccordion && (
          <div className={cx('accordion-block', { expanded: this.state.expanded })}>
            <div
              className={cx({ 'accordion-toggler': true, rotated: this.state.expanded })}
              onClick={this.toggleAccordion}
            />
          </div>
        )}
      </div>
    );
  }
}
