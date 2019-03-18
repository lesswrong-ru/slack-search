import * as React from 'react';

import Link from '../components/Link';

import ArchiveLayout from '../components/ArchiveLayout';

const ChannelListPage = () => {
  const [channels, setChannels] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/archive/channels.json')
      .then(response => response.json())
      .then(j => setChannels(j));
  }, []);

  return (
    <ArchiveLayout>
      <ul>
        {channels
          .sort((c1, c2) => (c1.name < c2.name ? -1 : 1))
          .map(channel => (
            <li>
              <Link href={`/archive/${channel.name}`}>{channel.name}</Link>
            </li>
          ))}
      </ul>
    </ArchiveLayout>
  );
};

export default ChannelListPage;
