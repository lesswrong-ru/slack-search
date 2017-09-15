import * as React from 'react';

const SLACK_SERVER = 'lesswrongru';
const SlackUpic = ({ user }) => (
    <div className="slack-upic">
      <a href={`https://${SLACK_SERVER}.slack.com/team/${user.name}`}>
        <img src={user.profile.image_72} />
      </a>
    </div>
);

export default SlackUpic;
