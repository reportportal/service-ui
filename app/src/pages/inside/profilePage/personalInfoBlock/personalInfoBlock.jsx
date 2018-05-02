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
/* eslint-disable react/no-danger */
// TODO when state access will be available add avatar's show/load logic
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import styles from './personalInfoBlock.scss';
import { BlockContainerBody, BlockContainerHeader } from '../blockContainer';
import PencilIcon from './img/pencil-icon-inline.svg';

const cx = classNames.bind(styles);

export class PersonalInfoBlock extends Component {
  static propTypes = {
    login: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    photoSrc: PropTypes.string,
  };
  static defaultProps = {
    login: '',
    name: '',
    email: '',
    photoSrc: '',
  };

  state = {
    avatarSource: '',
    photoLoaded: false,
  };

  componentWillMount() {
    this.setState({ avatarSource: this.props.photoSrc });
  }
  onClickUploadPhoto = () => {
    this.fileSelector.click();
  };
  selectPhotoHandler = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      if (this.validateFileExtension(file)) {
        const reader = new FileReader();
        const image = new Image();
        reader.readAsDataURL(file);
        reader.onload = (_file) => {
          image.src = _file.target.result;
          image.onload = () => {
            // if (this.validateImageSize(image, file)) {
            //   console.log('valid');
            this.setState({ avatarSource: _file.target.result });
            //   self.$profileAvatar.attr('src', _file.target.result);
            //   self.$editPhotoBlock.hide();
            //   self.$uploadPhotoBlock.show();
            //   self.$wrongImageMessage.hide().removeClass('shown');
            //   self.$profileAvatar.parent().removeClass('active');
            // } else {
            //   console.log('invalid');
            //   self.$editPhotoBlock.show();
            //   self.$uploadPhotoBlock.hide();
            //   self.$wrongImageMessage.show().addClass('shown');
            // }
          };
        };
      } else {
        // this.$wrongImageMessage.show();
      }
    }
  };
  validateFileExtension = file => (/\.(gif|jpg|jpeg|png)$/i).test(file.name);
  validateImageSize = (image, file) => {
    const width = image.width;
    const height = image.height;
    const size = Math.floor(file.size / 1024);
    return size <= 1000 && width <= 300 && height <= 500;
  };


  render() {
    // const xhr = new XMLHttpRequest();
    // const url = `/api/v1/data/photo?superadmin?at=${Date.now()}` +
    //  `&access_token=14113ab4-9c8f-421f-a203-fe86b7c964f6`;
    // xhr.open('GET', url, false);
    // xhr.send();
    // xhr.onreadystatechange = function () { // (3)
    //   if (xhr.readyState !== 4) return;
    //   if (xhr.status === 200) {
    //     console.log(xhr);
    //   }
    // };

    return (
      <div className={cx('personal-info-block')}>
        <BlockContainerHeader>
          <FormattedMessage id={'PersonalInfoBlock.header'} defaultMessage={'Personal information'} />
        </BlockContainerHeader>
        <BlockContainerBody>
          <div className={cx('block-content')}>
            <div className={cx('avatar-wrapper')}>
              <img className={cx('avatar')} src={this.state.avatarSource} alt="Profile avatar" />
            </div>
            <div className={cx('info')}>
              <div className={cx('login')}>
                { this.props.login }
              </div>
              <div className={cx('name-field')}>
                <span className={cx('name')}>
                  { this.props.name }
                  <i className={cx('name-pencil-icon')} dangerouslySetInnerHTML={{ __html: PencilIcon }} />
                </span>
              </div>
              <div className={cx('email')}>
                { this.props.email }
                { <i className={cx('email-pencil-icon')} dangerouslySetInnerHTML={{ __html: PencilIcon }} /> }
              </div>
              <div className={cx('photo-controls')}>
                <div className={cx('input-file')}>
                  <input ref={(inputFile) => { this.fileSelector = inputFile; }} onChange={this.selectPhotoHandler} type="file" accept="image/gif, image/jpeg, image/png" />
                </div>
                <div className={cx('photo-btn')}>
                  <GhostButton onClick={this.onClickUploadPhoto}>
                    <FormattedMessage id={'PersonalInfoBlock.uploadPhoto'} defaultMessage={'Upload photo'} />
                  </GhostButton>
                </div>
                <div className={cx('photo-btn')}>
                  <GhostButton>
                    <FormattedMessage id={'PersonalInfoBlock.removePhoto'} defaultMessage={'Remove photo'} />
                  </GhostButton>
                </div>
              </div>
            </div>

            <div className={cx('change-pass-btn')}>
              <GhostButton>
                <FormattedMessage id={'PersonalInfoBlock.changePassword'} defaultMessage={'Change password'} />
              </GhostButton>
            </div>

          </div>
        </BlockContainerBody>
      </div>
    );
  }
}
