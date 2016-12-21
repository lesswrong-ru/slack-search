import * as React from 'react';
import SlackMessage from './components/SlackMessage';

export class ArchiveChannelList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
    };
  }

  componentWillMount () {
    fetch(`/archive-data/channels.json`)
      .then(response => {
        return response.json().then(
          (json) => {
            this.setState({ channels: json });
          }
        )
      });
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
  constructor(props) {
    super(props);
    this.state = {
      dates: [],
    };
  }

  componentWillMount () {
    fetch(`/archive-data/${this.props.params.channel}/dates`)
      .then(response => {
        return response.json().then(
          (json) => {
            this.setState({ dates: json });
          }
        )
      });
  }

  render() {
    return (
      <div className="slack-archive">
        <header>
          <h1>{this.props.params.channel}</h1>
        </header>
        <ul>
        {
          this.state.dates.map(
            date => (
              <li>
                <a href={`/archive/${this.props.params.channel}/${date}`}>{date}</a>
              </li>
            )
          )
        }
        </ul>
      </div>
    );
  }
}


export class ArchiveLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      log: [],
      users: {},
    };
  }

  componentWillMount () {
    fetch(`/archive-data/users.json`)
      .then(response => {
        return response.json().then(
          (json) => {
            let usersDict = {};
            json.forEach(
              user => {
                usersDict[user.id] = user;
              }
            );
            this.setState({ users: usersDict })
          }
        )
      });

    fetch(`/archive-data/${this.props.params.channel}/${this.props.params.date}.json`)
      .then(response => {
        response.json().then(
          (json) => this.setState({ log: json })
        )
      });
  }

  render () {
    return (
      <div className="slack-archive">
        <header>
          <h1>#{this.props.params.channel} {this.props.params.date}</h1>
        </header>
        <div className="slack-archive-messages">
        {
          this.state.log.map(
            item => {
              const user = this.state.users[item.user];
              const username = (user ? user.name : 'UNKNOWN');
              return <SlackMessage {...item} user={username} channel={this.props.params.channel} />;
            }
          )
        }
        </div>
      </div>
    );
  }
}
