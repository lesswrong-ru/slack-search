#!/usr/bin/env python3

import os
import os.path
import json
import requests

class SlackArchive:
    def __init__(self, root):
        self.root = root

    def users(self):
        users_file = self.root + '/users.json'
        users_data = json.load(open(users_file))

        for user in users_data:
            yield user

    def channels(self):
        channels_file = self.root + '/channels.json'
        for channel in json.load(open(channels_file)):
            yield channel

    def channel_names(self):
        for channel in self.channels():
            yield channel['name']

    def channel_logs(self, channel_name):
        directory = self.root + '/' + channel_name

        for filename in os.listdir(directory):
            full_name = os.path.join(directory, filename)
            if not os.path.isfile(full_name):
                continue
            yield filename

    def process_log(self, channel_name, filename):
        full_name = self.root + '/' + channel_name + '/' + filename
        messages = json.load(open(full_name))
        for message in messages:
            message['channel'] = channel_name
            yield message


class Elastic:
    def __init__(self, endpoint='http://localhost:9200'):
        self.endpoint = endpoint

    def add(self, index, doc_type, doc_id, content):
        r = requests.put(
            '{endpoint}/{index}/{type}/{id}'.format(
                endpoint=self.endpoint,
                index=index,
                type=doc_type,
                id=doc_id
            ),
            json=content
        )
        r.raise_for_status()


def index_users(archive, elastic):
    for user in archive.users():
        elastic.add('slack', 'user', user['id'], user)


def index_messages(archive, elastic):
    for channel in archive.channel_names():
        for filename in archive.channel_logs(channel):
            print('{}/{}'.format(channel, filename))

            for message in archive.process_log(channel, filename):
                if 'user' not in message:
                    continue

                elastic.add(
                    'slack',
                    'message',
                    message['user'] + '_' + message['ts'],
                    message
                )

def main():
    archive = SlackArchive('/Users/berekuk/Downloads/slack/nov-24')
    elastic = Elastic()
    #index_users(archive, elastic)
    index_messages(archive, elastic)

main()
