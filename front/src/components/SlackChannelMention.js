import * as React from 'react';

import Link from './Link';

const SlackChannelMention = ({name}) => (
  <span className="slack-channel-mention">
    <Link href={`/archive/${name}`}>
      #{name}
    </Link>
  </span>
);

export default SlackChannelMention;
