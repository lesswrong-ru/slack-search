import * as React from 'react';

import Link from '../components/Link';
import ArchiveLayout from '../components/ArchiveLayout';

export default class ChannelDatesPage extends React.Component {
  state = {
    dates: [],
  };

  async componentWillMount() {
    const response = await fetch(`/api/channel-dates/${this.props.match.params.channel}`)
    const json = await response.json();
    this.setState({ dates: json });
  }

  render() {
    return (
      <ArchiveLayout>
        <header>
          <h1>#{this.props.match.params.channel}</h1>
        </header>
        <ul>
          {
            this.state.dates.map(
              date => (
                <li>
                  <Link href={`/archive/${this.props.match.params.channel}/${date}`}>{date}</Link>
                </li>
              )
            )
          }
        </ul>
      </ArchiveLayout>
    );
  }
}
