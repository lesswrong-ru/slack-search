import * as React from 'react';

const SLACK_SERVER = 'lesswrongru'
const SlackUserMention = ({ name }) => (
  <span className="slack-user-mention">
    <a href={`https://${SLACK_SERVER}.slack.com/team/${name}`}>
      @{name}
    </a>
  </span>
);

export default SlackUserMention;
