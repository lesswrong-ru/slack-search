from datetime import datetime
import json
import os.path
import os
import sys


class SlackLog:
    def __init__(self, archive, channel_name, filename):
        self.archive = archive
        self.channel_name = channel_name
        self.filename = filename

    def read_all(self):
        full_name = self.archive.root + '/' + self.channel_name + '/' + self.filename
        messages = json.load(open(full_name))
        for message in messages:
            message['channel'] = self.channel_name
            yield message

    def date(self):
        return datetime.strptime(self.filename, '%Y-%m-%d.json').date()


class SlackArchive:
    def __init__(self, root):
        self.root = root

    def users(self):
        users_file = self.root + '/users.json'
        users_data = json.load(open(users_file))

        for user in users_data:
            yield user

    def users_dict(self):
        users = {}
        for user in self.users():
            users[user['id']] = user['name']

        return users

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
            yield SlackLog(self, channel_name, filename)

    def traverse(self, min_date=None, max_date=None):
        for channel_name in self.channel_names():
            print('processing channel ' + channel_name, file=sys.stderr)
            for log in self.channel_logs(channel_name):
                if (min_date and log.date() < min_date) or (max_date and log.date() > max_date):
                    continue
                for message in log.read_all():
                    yield message
