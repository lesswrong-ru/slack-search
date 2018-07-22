import * as React from 'react';
import { observer, inject } from 'mobx-react';

import moment from 'moment';

import SlackUser from './SlackUser';
import SlackUpic from './SlackUpic';
import SlackText from './SlackText';

import './SlackMessage.css';

const SLACK_SERVER = 'lesswrongru';

const SlackMessage = inject('store')(
  observer(
    class SlackMessage extends React.Component {

      render() {
        const { store, message, collapse } = this.props;

        const ts = moment(parseFloat(message.ts) * 1000);
        const now = moment();
        const date =
          ts.year() === now.year()
            ? ts.format('MMM Do')
            : ts.format('YYYY MMM Do');

        const user = store.getUser(message.user);

        let asideEl = <SlackUpic user={user} />;
        let timeEl = (
          <div className="time">
            <a
              href={`https://${SLACK_SERVER}.slack.com/archives/${
                message.channel
              }/p${message.ts.replace('.', '')}`}
            >
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
            <div className="slack-message__aside">{asideEl}</div>

            <div className="slack-message__main">
              {headlineEl}

              <SlackText message={message} />
            </div>
          </div>
        );
      }
    }
  )
);

export default SlackMessage;
