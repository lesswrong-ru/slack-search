import * as React from 'react';

import styled from 'styled-components';

import Link from '../components/Link';
import ArchiveLayout from '../components/ArchiveLayout';

const EmptyLink = styled(Link)`
  color: #999;
`;

const DateLink = ({ date, 'has-messages': hasMessages }) => {
  const Component = hasMessages ? Link : EmptyLink;

  return (
    <Component href={`/archive/${this.props.match.params.channel}/${date}`}>
      {date}
    </Component>
  );
};

export default class ChannelDatesPage extends React.Component {
  state = {
    dates: [],
  };

  async componentWillMount() {
    const response = await fetch(
      `/api/channel-dates-v2/${this.props.match.params.channel}`
    );
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
          {this.state.dates.map(dateInfo => (
            <li key={dateInfo.date}>
              <DateLink {...dateInfo} />
            </li>
          ))}
        </ul>
      </ArchiveLayout>
    );
  }
}
