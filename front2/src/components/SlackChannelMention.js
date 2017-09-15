import * as React from 'react';

const SlackChannelMention = ({name}) => (
  <span className="slack-channel-mention">
    <a href={`/archive/${name}`}>
      #{name}
    </a>
  </span>
);

export default SlackChannelMention;
