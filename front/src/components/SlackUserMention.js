import * as React from 'react';

import Link from './Link';

const SLACK_SERVER = 'lesswrongru'
const SlackUserMention = ({ name }) => (
  <Link href={`https://${SLACK_SERVER}.slack.com/team/${name}`}>
    @{name}
  </Link>
);

export default SlackUserMention;
