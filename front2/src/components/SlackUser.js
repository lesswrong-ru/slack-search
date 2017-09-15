import * as React from 'react';

const SLACK_SERVER = 'lesswrongru'
const SlackUser = ({ name }) => (
  <div className="slack-user">
    <a href={`https://${SLACK_SERVER}.slack.com/team/${name}`}>
      {name}
    </a>
  </div>
);

export default SlackUser;
