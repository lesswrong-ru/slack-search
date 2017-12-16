import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';

import { Provider } from 'mobx-react';
import { MainStore } from '../store';

import '../index.css';
import 'searchkit/release/theme.css';

import SlackChannelMention from '../components/SlackChannelMention';
import SlackUserMention from '../components/SlackUserMention';

import SlackChannel from '../components/SlackChannel';
import SlackUser from '../components/SlackUser';

import SlackMessage from '../components/SlackMessage';

const messageFixture = {
  "millits": 1511907856000,
  "user": "U0G0JFJTA",
  "thread_ts": "1511857035.000020",
  "username": "alaric",
  "text": "&gt; Вижу пользу в отсеве таких людей из моего окружения. \nМне кажется крайне вероятным, что твои цели и цели других завсегдатаев этого канала здесь расходятся. Я бы хотел тебя попросить не предпринимать действий, направленных на отсев людей из этого канала.",
  "parent_user_id": "U0FS0PUM8",
  "type": "message",
  "channel": "prj_nvc",
  "ts": "1511907856.000377"
}

const usersFixture = [
  {
    "id": "U0G0JFJTA",
    "team_id": "T0CTD4Q0K",
    "name": "alaric",
    "deleted": false,
    "color": "43761b",
    "real_name": "alaric",
    "tz": "Europe/Moscow",
    "tz_label": "Moscow Time",
    "tz_offset": 10800,
    "profile": {
      "$mobx": {},
      "avatar_hash": "487429dcbb35",
      "image_24": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_24.jpg",
      "image_32": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_32.jpg",
      "image_48": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_48.jpg",
      "image_72": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_72.jpg",
      "image_192": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_192.jpg",
      "image_512": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_512.jpg",
      "image_1024": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_1024.jpg",
      "image_original": "https://avatars.slack-edge.com/2015-12-09/16313210690_487429dcbb35f1adbf3d_original.jpg",
      "fields": {},
      "first_name": "",
      "last_name": "",
      "title": "Переводчик \"ГПиМРМ\" и не только.",
      "phone": "",
      "skype": "",
      "real_name": "alaric",
      "display_name": "",
      "real_name_normalized": "alaric",
      "display_name_normalized": "",
      "team": "T0CTD4Q0K"
    },
    "is_admin": false,
    "is_owner": false,
    "is_primary_owner": false,
    "is_restricted": false,
    "is_ultra_restricted": false,
    "is_bot": false,
    "updated": 1504708674,
    "is_app_user": false
  }
];

const wrapper = story => {
  const store = new MainStore();
  store.setUsers(usersFixture);
  return (
    <Provider store={store}>
      <div className="slack-root">
        <div className="slack-archive" style={{paddingTop: 20, paddingBottom: 20}}>
          <div className="slack-archive-messages">
          {story()}
          </div>
        </div>
      </div>
    </Provider>
  );
};

storiesOf('Welcome', module)
  .add('to Storybook', () => (
    <Welcome showApp={linkTo('Button')}/>
  ));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>Hello Button</Button>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>
  ));

storiesOf('Inline elements', module)
  .addDecorator(wrapper)
  .add('channel', () => [
    'Пишите в ',
    <SlackChannelMention name='open' />
  ])
  .add('user', () => [
    'Хочу тегнуть ',
    <SlackUserMention name='berekuk' />
  ]);

storiesOf('Block elements', module)
  .addDecorator(wrapper)
  .add('channel', () => (
    <SlackChannel name='open' />
  ))
  .add('user', () => (
    <SlackUser name='berekuk' />
  ))
  .add('message', () => (
    <SlackMessage message={messageFixture} />
  ))
