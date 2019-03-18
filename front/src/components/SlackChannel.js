import * as React from 'react';

import styled from 'styled-components';

const SlackChannelDiv = styled.div`
  font-weight: bold;
  a {
    color: #333;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const SlackChannel = ({name}) => (
  <SlackChannelDiv>
    <a href={`/archive/${name}`}>
      #{name}
    </a>
  </SlackChannelDiv>
);

export default SlackChannel;
