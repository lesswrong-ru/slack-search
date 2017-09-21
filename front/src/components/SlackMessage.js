import * as React from 'react';
import moment from 'moment';

import SlackChannel from './SlackChannel';
import SlackChannelMention from './SlackChannelMention';
import SlackUser from './SlackUser';
import SlackUserMention from './SlackUserMention';
import SlackUpic from './SlackUpic';

import './SlackMessage.css';

import { observer, inject } from 'mobx-react';

const SLACK_SERVER = 'lesswrongru';

const SpecialMention = ({ text }) => (
  <span style={{fontWeight: 'bold', background: '#fff4bf'}}>
    @{text}
  </span>
);

const SlackMessage = inject("store")(observer(
  class SlackMessage extends React.Component {
    parseLink(link) {
      const fallback = () => <code>{'<' + link + '>'}</code>;

      if (link.substr(0, 2) === '@U') {
        const user_id = link.substr(1);
        const user = this.props.store.getUser(user_id);
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
        return <SpecialMention text={link.substr(1)} />
      }
      else if (link.substr(0, 2) === '@W') { // slack documents that it should be replaced like @U, but I can't find any examples for @W
        return fallback();
      }
      else {
        return <a href={link}>{link}</a>;
      }
    }

    renderText() {
      const { message } = this.props;
      let bits = message.text.split(/(<.*?>|\n)/);
      bits = bits.map(
        bit => {
          if (bit === '\n') {
            return <br />;
          }
          const match = bit.match(/^<(.*?)>$/);
          if (!match) {
            return bit;
          }
          return this.parseLink(match[1]);
        }
      );
      return bits;

      const text = message.text.replace(
        /<(.*?)>/g,
        (match, inner) => this.parseLink(inner)
      );
      return text;
    }

    render() {
      const { store, message, collapse } = this.props;

      const ts = moment(parseFloat(message.ts) * 1000);
      const now = moment();
      const date = (ts.year() === now.year() ? ts.format('MMM Do') : ts.format('YYYY MMM Do'));

      const user = store.getUser(message.user);

      let asideEl = (
        <SlackUpic user={user} />
      );
      let timeEl = (
        <div className="time">
          <a href={`https://${SLACK_SERVER}.slack.com/archives/${message.channel}/p${message.ts.replace('.', '')}`}>
            {ts.format('HH:mm')}
          </a>
        </div>
      );
      let headlineEl = (
        <div className="slack-message__headline">
          <SlackUser name={user.name} />
          {timeEl}
        </div>
      );
      if (collapse) {
        asideEl = timeEl;
        headlineEl = undefined;
      }

      return (
        <div className="slack-message">
          <div className="slack-message__aside">
            {asideEl}
          </div>

          <div className="slack-message__main">
            {headlineEl}

            <div className="slack-message-text">
              {this.renderText()}
            </div>
          </div>
        </div>
      );
    }
  }
));

export default SlackMessage;
