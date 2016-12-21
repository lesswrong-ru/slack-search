import * as React from 'react';
import SlackMessage from './components/SlackMessage';

class SlackArchive extends React.Component {
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
        response.json().then(
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

export default SlackArchive;
