import * as React from 'react';

const SlackChannel = ({name}) => (
    <div className="slack-channel">
    <a href={`/archive/${name}`}>
#{name}
  </a>
    </div>
);

export default SlackChannel;
