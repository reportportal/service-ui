import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { buildAssetLink } from '../utils';
import { CommandItem } from './commandItem';

export class CommandsContent extends Component {
  static propTypes = {
    commands: PropTypes.array,
    assets: PropTypes.object,
    authToken: PropTypes.string,
    observer: PropTypes.object,
  };

  static defaultProps = {
    commands: [],
    assets: {},
    authToken: '',
    observer: {},
  };

  onCommandItemClick = (time) => () => {
    this.props.observer.publish('goToVideoTimeline', time);
  };

  buildScreenShotLink = (item) => {
    const {
      assets: { assetsPrefix, screenshots = [] },
      authToken,
    } = this.props;
    return buildAssetLink(assetsPrefix, screenshots[item.screenshot], authToken);
  };

  render() {
    const { commands } = this.props;

    return (
      <ScrollWrapper autoHeight autoHeightMax={610} hideTracksWhenNotNeeded autoHide>
        {commands.map((item) => (
          <CommandItem
            key={item.start_time}
            command={item}
            onItemClick={this.onCommandItemClick(item.in_video_timeline)}
            screenShotLink={this.buildScreenShotLink(item)}
          />
        ))}
      </ScrollWrapper>
    );
  }
}
