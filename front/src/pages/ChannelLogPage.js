import * as React from 'react';
import { observer, inject } from 'mobx-react';

import styled from 'styled-components';

import SlackChannel from '../components/SlackChannel';
import SlackMessage from '../components/SlackMessage';
import ArchiveLayout from '../components/ArchiveLayout';

async function findPrevNextDate(channel, date) {
  const response = await fetch(`/api/channel-dates/${channel}`)
  const dates = await response.json();

  const index = dates.findIndex(d => d === date);

  const dateByIndex = (i) => (0 <= i && i < dates.length) ? dates[i] : null;
  return [dateByIndex(index - 1), dateByIndex(index + 1)];
}

const DateLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  a {
    color: #666;
    text-decoration: none;
    &:hover {
      text-decoration: none;
      color: #333;
    }
  }
`;

const MessagesDiv = styled.div`
  background-color: white;
  border: 1px solid #e8e8e8;
  padding: 10px 0;
  margin-bottom: 40px;
`;

const ChannelLogPage = inject("store")(observer(
  class ChannelLogPage extends React.Component {
    state = {
      log: [],
    };

    async componentWillMount() {
      const response = await fetch(`/api/archive/${this.channel()}/${this.date()}.json`);
      const json = await response.json();

      this.setState({
        log: json,
      });
      await this.addPrevNextLinks();
    }

    async addPrevNextLinks() {
      const [prevDate, nextDate] = await findPrevNextDate(this.channel(), this.date());
      this.setState({
        prevDate, nextDate
      });
    }

    channel() {
      return this.props.match.params.channel;
    }
    date() {
      return this.props.match.params.date;
    }

    renderDate() {
      return (
        <DateLine>
          <div>{this.state.prevDate ? <a href={`/archive/${this.channel()}/${this.state.prevDate}`}>←</a> : null}</div>
          <div>{this.date()}</div>
          <div>{this.state.nextDate ? <a href={`/archive/${this.channel()}/${this.state.nextDate}`}>→</a> : null}</div>
        </DateLine>
      );
    }

    render() {
      return (
        <ArchiveLayout>
          <header className="slack-archive-page-title">
            <SlackChannel name={this.channel()} />
            {this.renderDate()}
          </header>
          <MessagesDiv>
          {
            this.state.log.map(
              (item, i) => {
                let user = this.props.store.users.get(item.user);
                if (!user) {
                  user = {
                    name: 'UNKNOWN',
                    profile: {
                      image_72: '',
                    },
                  };
                }
                let collapse = false;
                if (i > 0) {
                  const prevItem = this.state.log[i - 1];
                  if (item.user === prevItem.user && parseFloat(item.ts) - parseFloat(prevItem.ts) < 300) {
                    collapse = true;
                  }
                }

                const message = {
                  ...item,
                  channel: this.props.match.params.channel,
                };
                return <SlackMessage message={message} collapse={collapse} key={i} />;
              }
            )
          }
          </MessagesDiv>
        </ArchiveLayout>
      );
    }
  }
));

export default ChannelLogPage;
