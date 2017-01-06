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

  let asideEl = (
    <SlackUpic user={message.full_user} />
  );
  let timeEl = (
    <div className="time">
      <a href={`https://${SLACK_SERVER}.slack.com/archives/${message.channel}/p${message.ts.replace('.', '')}`}>
        {ts.format('HH:mm')}
      </a>
    </div>
  );
  let headlineEl = (
    <div className="slack-message__headline">
      <SlackUser name={message.full_user.name} />
      {timeEl}
    </div>
  );
  if (message.collapse) {
    asideEl = timeEl;
    headlineEl = undefined;
  }

  return (
    <div className="slack-message">
      <div className="slack-message__aside">
        {asideEl}
      </div>

      <div className="slack-message__main">
        {headlineEl}

        <div className="message-text">
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default SlackMessage;
