#!/usr/bin/env python3

import argparse
import json
import os
import sys
import re
import os.path
from datetime import datetime
from collections import defaultdict
from termcolor import colored

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


class Stat:
    def __init__(self):
        self.emoji = defaultdict(lambda: defaultdict(int))

    def add_emoji(self, target, emoji):
        self.emoji[target][emoji] += 1

    def top_users(self, emoji, n):
        top = []
        for user in self.emoji.keys():
            top.append({
                'user': user,
                'count': self.emoji[user][emoji]
            })

        top.sort(key=lambda e: e['count'], reverse=True)
        return top[:n]

    def print_top(self, emoji, n):
        print()
        print(colored('*Top {} :{}:*'.format(n, emoji), 'red'))

        for e in self.top_users(emoji, n):
            print('@{}\t{}'.format(e['user'], e['count']))

    def print(self):
        self.print_top('+1', 10)
        self.print_top('-1', 10)
        self.print_top('heavy_plus_sign', 10)
        self.print_top('heavy_minus_sign', 10)
        self.print_top('delta', 10)
        self.print_top('facepalm', 10)


def load_users(archive):
    users = {}
    for user in archive.users():
        users[user['id']] = user['name']

    return users


def normalize_emoji(emoji):
    return re.sub(r'::.*', '', emoji)


def process_message(message, users, stat):
    if not 'user' in message:
        return
    user_id = message['user']
    if not user_id in users:
        if user_id != 'USLACKBOT':
            print('{} not found'.format(user_id))
        return
    author = users[user_id]

    if 'reactions' in message:
        for reaction in message['reactions']:
            emoji = reaction['name']
            emoji = normalize_emoji(emoji)
            for rater_id in reaction['users']:
                rater = users[rater_id]
                stat.add_emoji(author, emoji)


def find_offenders(archive, min_date=None, max_date=None):
    users = load_users(archive)
    dup_stats = defaultdict(int)
    total_stats = defaultdict(int)
    total_message_length = defaultdict(int)

    prev_message = None
    for message in archive.traverse(min_date=min_date, max_date=max_date):
        if message['type'] != 'message' or not 'user' in message:
            continue

        if not prev_message:
            prev_message = message
            continue

        user = users.get(message['user'], 'UNKNOWN')
        total_stats[user] += 1
        total_message_length[user] += len(message['text'])

        if message['user'] == prev_message['user'] and float(message['ts']) - float(prev_message['ts']) < 30:
            dup_stats[user] += 1

        prev_message = message

    for user in sorted(dup_stats.keys()):
        if total_stats[user] < 100:
            continue
        print(
            '{:<20}{:<10}{:<10}{:<10.3}\t{:>5.3f}'.format(
                user,
                dup_stats[user],
                total_stats[user],
                dup_stats[user] / total_stats[user],
                total_message_length[user] / total_stats[user],
            )
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--min-date')
    parser.add_argument('--max-date')
    parser.add_argument('root')
    parser.add_argument('mode', nargs='?', default='emoji', choices=['emoji', 'offenders'])

    args = parser.parse_args()

    def parse_if_defined(maybe_date_str):
        return datetime.strptime(maybe_date_str, '%Y-%m-%d').date() if maybe_date_str else None

    min_date = parse_if_defined(args.min_date)
    max_date = parse_if_defined(args.max_date)

    archive = SlackArchive(args.root)

    if args.mode == 'emoji':
        users = load_users(archive)
        stat = Stat()

        for message in archive.traverse(min_date=min_date, max_date=max_date):
            process_message(message, users, stat)

        print()
        stat.print()

    elif args.mode == 'offenders':
        find_offenders(archive, max_date=max_date, min_date=min_date)

main()
