import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { projectIdSelector } from 'controllers/pages';
import { URLS } from 'common/urls';
import AttachIcon from 'common/img/attachment-inline.svg';
import styles from './attachmentBlock.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectId: projectIdSelector(state),
}))
export class AttachmentBlock extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    value: PropTypes.object,
    customProps: PropTypes.object,
  };

  static defaultProps = {
    projectId: '',
    value: {},
    customProps: {},
  };

  getAttachmentUrl = (id) => URLS.logAttachment(this.props.projectId, id);

  switchAttachmentCommonType = (value) => {
    const attachmentType = value.content_type.split('/');

    switch (attachmentType[0]) {
      case 'image':
        return (
          <a href={this.getAttachmentUrl(value.id)}>
            <img
              className={cx('image')}
              alt="preview"
              src={this.getAttachmentUrl(value.thumbnail_id)}
            />
          </a>
        );
      default:
        return this.switchAttachmentType(value, attachmentType[1]);
    }
  };

  switchAttachmentType = (value, type) => {
    switch (type) {
      case 'xml':
      case 'javascript':
      case 'json':
      case 'css':
      case 'php':
      case 'har':
        return (
          <a href={this.getAttachmentUrl(value.id)}>
            <div className={cx('image', `${type}`)} />
          </a>
        );
      case 'txt':
      case 'html':
        return (
          <a href={this.getAttachmentUrl(value.id)} target="_blank">
            <div className={cx('image', `${type}`)} />
          </a>
        );
      case 'zip':
      case 'rar':
      case 'tgz':
      case 'tar':
      case 'gzip':
        return (
          <a href={this.getAttachmentUrl(value.id)} target="_blank">
            <div className={cx('image', 'archive')} />
          </a>
        );
      default:
        return (
          <a href={this.getAttachmentUrl(value.id)} target="_blank">
            <div className={cx('image', 'other')} />
          </a>
        );
    }
  };

  render() {
    const {
      value,
      customProps: { consoleView },
    } = this.props;

    return (
      <div className={cx('attachment-block')}>
        {consoleView ? (
          <a href={this.getAttachmentUrl(value.id)}>
            <div className={cx('image', 'attachment')}>{Parser(AttachIcon)}</div>
          </a>
        ) : (
          this.switchAttachmentCommonType(value)
        )}
      </div>
    );
  }
}
