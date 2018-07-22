import * as React from 'react';
import { observer, inject } from 'mobx-react';

import styled from 'styled-components';

import SlackChannelMention from './SlackChannelMention';
import SlackUserMention from './SlackUserMention';

const SpecialMentionSpan = styled.span`
  font-weight: bold;
  background: #fff4bf;
`;

const SpecialMention = ({ text }) => (
  <SpecialMentionSpan>@{text}</SpecialMentionSpan>
);

const SlackLink = inject('store')(observer(
  ({ store, link }) => {
    const fallback = () => <code>{'<' + link + '>'}</code>;

    if (link.substr(0, 2) === '@U') {
      const user_id = link.substr(1);
      const user = store.getUser(user_id);
      return <SlackUserMention name={user.name} />;
    }
    else if (link.substr(0, 2) === '#C') {
      const match = link.match(RegExp('#C.*?\\|(.*)'));
      if (!match) {
        return fallback(); // can't parse
      }
      return <SlackChannelMention name={match[1]} />;
    }
    else if (link[0] === '!') {
      return <SpecialMention text={link.substr(1)} />;
    }
    else if (link.substr(0, 2) === '@W') {
      // slack documents that it should be replaced like @U, but I can't find any examples for @W
      return fallback();
    }
    else {
      return <a href={link}>{link}</a>;
    }
  }
));

const Container = styled.div`
  /* breaks and hyphens - https://css-tricks.com/snippets/css/prevent-long-urls-from-breaking-out-of-container/ */
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;

  color: #2c2d30;
  line-height: 1.46668;
`;

const SlackText = ({ message }) => {
  let text = message.text || '';
  let bits = text.split(/(<.*?>|\n)/);
  bits = bits.map(bit => {
    if (bit === '\n') {
      return <br />;
    }
    const match = bit.match(/^<(.*?)>$/);
    if (!match) {
      return bit;
    }
    return <SlackLink link={match[1]} />;
  });

  return (
    <Container>{bits}</Container>
  );
};

export default SlackText;
