import * as React from 'react';

import styled from 'styled-components';

const UserDiv = styled.div`
  font-weight: 900;
  a {
    text-decoration: none;
    color: #2c2d30;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SLACK_SERVER = 'lesswrongru'
const SlackUser = ({ name }) => (
  <UserDiv>
    <a href={`https://${SLACK_SERVER}.slack.com/team/${name}`}>
      {name}
    </a>
  </UserDiv>
);

export default SlackUser;
