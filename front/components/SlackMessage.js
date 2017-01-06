import * as React from 'react';
import moment from 'moment';

import SlackChannel from './SlackChannel';
import SlackUser from './SlackUser';
import SlackUpic from './SlackUpic';

const SLACK_SERVER = 'lesswrongru';
const SlackMessage = (message) => {
  const ts = moment(parseFloat(message.ts) * 1000);
  const now = moment();
  const date = (ts.year() === now.year() ? ts.format('MMM Do') : ts.format('YYYY MMM Do'));


  return (
    <div className="slack-message">
      <div className="slack-message__aside">
        <SlackUpic user={message.full_user} />
      </div>

      <div className="slack-message__main">
        <div className="slack-message__headline">
          <SlackUser name={message.full_user.name} />
          <div className="time">
            <a href={`https://${SLACK_SERVER}.slack.com/archives/${message.channel}/p${message.ts.replace('.', '')}`}>
              {ts.format('HH:mm')}
            </a>
          </div>
        </div>

        <div className="message-text">
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default SlackMessage;
