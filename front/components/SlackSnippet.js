import * as React from 'react';
import moment from 'moment';

import SlackChannel from './SlackChannel';
import SlackUser from './SlackUser';

const SlackSnippet = (message) => {
  const ts = moment(parseFloat(message.ts) * 1000);
  const now = moment();
  const date = (ts.year() === now.year() ? ts.format('MMM Do') : ts.format('YYYY MMM Do'));

  return (
    <div className="message">
      <div className="message-context">
        <SlackChannel name={message.channel} />
        <div className="message-date">
          <a href={`/archive/${message.channel}/${ts.format('YYYY-MM-DD')}`}>
            {date}
          </a>
        </div>
      </div>

      <div className="message-main">
        <SlackUser name={message.user} />
        <div className="message-text">
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default SlackSnippet;
