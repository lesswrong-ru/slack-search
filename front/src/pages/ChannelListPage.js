import * as React from 'react';

import ArchiveLayout from '../components/ArchiveLayout';

export default class ChannelListPage extends React.Component {
  state = {
    channels: [],
  };

  async componentWillMount() {
    const response = await fetch('/api/archive/channels.json');
    const json = await response.json();
    this.setState({ channels: json });
  }

  render() {
    return (
      <ArchiveLayout>
        <ul>
          {
            this.state.channels.map(
              channel => (
                <li>
                  <a href={`/archive/${channel.name}`}>{channel.name}</a>
                </li>
              )
            )
          }
        </ul>
      </ArchiveLayout>
    );
  }
}
