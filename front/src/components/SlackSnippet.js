import * as React from 'react';

import styled from 'styled-components';

import moment from 'moment';

import SlackChannel from './SlackChannel';
import SlackMessage from './SlackMessage';

const SnippetContainer = styled.div`
  border-bottom: 1px #ddd solid;
  max-width: 600px;
  padding: 8px 0;
  margin: 8px 0;
`;

const SnippetContext = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const SnippetDate = styled.div`
  font-size: 0.8em;
  color: #999;

  a {
    text-decoration: none;
    color: #999;
    &:hover {
      text-decoration: underline;
    }
  }

`;

const SlackSnippet = ({ message }) => {
  const ts = moment(parseFloat(message.ts) * 1000);
  const now = moment();
  const date = (ts.year() === now.year() ? ts.format('MMM Do') : ts.format('YYYY MMM Do'));

  return (
    <SnippetContainer>
      <SnippetContext>
        <SlackChannel name={message.channel} />
        <SnippetDate>
          <a href={`/archive/${message.channel}/${ts.format('YYYY-MM-DD')}`}>
            {date}
          </a>
        </SnippetDate>
      </SnippetContext>
      <SlackMessage message={message} />
    </SnippetContainer>
  );
};

export default SlackSnippet;
