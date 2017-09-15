import * as React from 'react';
import moment from 'moment';

import SlackChannel from './SlackChannel';
import SlackMessage from './SlackMessage';

import './SlackSnippet.css';

const SlackSnippet = ({ message }) => {
  const ts = moment(parseFloat(message.ts) * 1000);
  const now = moment();
  const date = (ts.year() === now.year() ? ts.format('MMM Do') : ts.format('YYYY MMM Do'));

  return (
    <div className="snippet">
      <div className="snippet-context">
        <SlackChannel name={message.channel} />
        <div className="snippet-date">
          <a href={`/archive/${message.channel}/${ts.format('YYYY-MM-DD')}`}>
            {date}
          </a>
        </div>
      </div>

      <div className="snippet-main">
        <SlackMessage message={message} />
      </div>
    </div>
  );
};

export default SlackSnippet;
