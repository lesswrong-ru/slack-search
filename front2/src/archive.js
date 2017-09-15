import 'whatwg-fetch';
import * as React from 'react';
import SlackMessage from './components/SlackMessage';
import SlackChannel from './components/SlackChannel';
import { observer, inject } from 'mobx-react';

export class ArchiveChannelList extends React.Component {
  state = {
    channels: [],
  };

  async componentWillMount() {
    const response = await fetch('/archive-data/channels.json');
    const json = await response.json();
    this.setState({ channels: json });
  }

  render() {
    return (
      <div className="slack-archive">
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
      </div>
    );
  }
}

export class ArchiveChannelDates extends React.Component {
  state = {
    dates: [],
  };

  async componentWillMount() {
    const response = await fetch(`/archive-data/${this.props.match.params.channel}/dates`)
    const json = await response.json();
    this.setState({ dates: json });
  }

  render() {
    return (
      <div className="slack-archive">
        <header>
          <h1>#{this.props.match.params.channel}</h1>
        </header>
        <ul>
        {
          this.state.dates.map(
            date => (
              <li>
                <a href={`/archive/${this.props.match.params.channel}/${date}`}>{date}</a>
              </li>
            )
          )
        }
        </ul>
      </div>
    );
  }
}


export const ArchiveLog = inject("store")(observer(
  class ArchiveLog extends React.Component {
    state = {
      log: [],
    };

    async componentWillMount() {
      const response = await fetch(`/archive-data/${this.props.match.params.channel}/${this.props.match.params.date}.json`);
      const json = await response.json();

      this.setState({
        log: json,
      });
    }

    render() {
      //console.log('render archive log');
      return (
        <div className="slack-archive">
        <header className="slack-archive-page-title">
        <SlackChannel name={this.props.match.params.channel} />
        <div>{this.props.match.params.date}</div>
        </header>
        <div className="slack-archive-messages">
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
        </div>
        </div>
      );
    }
  }
));
