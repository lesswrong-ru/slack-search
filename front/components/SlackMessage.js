import * as React from 'react';
import moment from 'moment';

const SlackMessage = (message) => {
  const ts = moment(parseFloat(message.ts) * 1000);
  const now = moment();
  const date = (ts.year() === now.year() ? ts.format('MMM Do') : ts.format('YYYY MMM Do'));

  return (
      <div className='message'>
      <div className='message-context'>
      <div className='message-channel'>
#{message.channel}
    </div>
      <div className='message-date'>
      {date}
    </div>
      </div>
      <div className='message-main'>
      <div className='message-author'>
      {message.user}
    </div>
      <div className='message-text'>
      {message.text}
    </div>
      </div>
      </div>
  );
};

export default SlackMessage;
