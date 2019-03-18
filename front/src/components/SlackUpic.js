import * as React from 'react';

import styled from 'styled-components';

const SLACK_SERVER = 'lesswrongru';

const Container = styled.div`
  img {
    width: 36px;
    height: 36px;
    border-radius: 3px;
  }
`;

const SlackUpic = ({ user }) => (
    <Container>
      <a href={`https://${SLACK_SERVER}.slack.com/team/${user.name}`}>
        <img src={user.profile.image_72} />
      </a>
    </Container>
);

export default SlackUpic;
