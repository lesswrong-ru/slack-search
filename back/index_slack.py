#!/usr/bin/env python3

from lwslack import SlackArchive

import argparse
import requests
from datetime import datetime
from termcolor import colored
import json

class Elastic:
    def __init__(self, endpoint='http://localhost:9200'):
        self.endpoint = endpoint
        self._bulk_buffer = []

    def delete_index(self, index):
        print(colored('Deleting index {}'.format(index), 'red'))
        requests.delete(
            '{}/{}'.format(self.endpoint, index)
        ).raise_for_status()

    def create_index(self, index):
        print(colored('Creating index {}'.format(index), 'green'))
        requests.put(
            '{}/{}'.format(self.endpoint, index),
            json={
                'mappings': {
                    '_doc': {
                        'properties': {
                            'millits': {
                                'type': 'date',
                                'format': 'epoch_millis',
                            },
                            'attachments': {
                                'properties': {
                                    'ts': {
                                        'type': 'text', # indexing fails otherwise
                                    }
                                }
                            },
                        }
                    }
                }
            }
        ).raise_for_status()

    def add(self, index, doc_id, content):
        r = requests.put(
            '{endpoint}/{index}/_doc/{id}'.format(
                endpoint=self.endpoint,
                index=index,
                id=doc_id
            ),
            json=content
        )

        if r.status_code == 400:
            print(r.text)
            print(content)
        r.raise_for_status()

    def bulk_push(self, index, doc_id, content):
        self._bulk_buffer.append(
            (index, doc_id, content)
        )
        if len(self._bulk_buffer) >= 100:
            self.bulk_commit()

    def bulk_commit(self):
        if not self._bulk_buffer:
            return

        requests.post(
            '{}/_bulk'.format(self.endpoint),
            data=''.join([
                json.dumps({
                    'index': {
                        '_index': item[0],
                        '_type': '_doc',
                        '_id': item[1],
                    }
                }) + '\n'
                + json.dumps(
                    item[2]
                ) + '\n'
                for item in self._bulk_buffer
            ])
        ).raise_for_status()
        self._bulk_buffer = []


INDEX = 'slack.messages'

def index_users(archive, elastic):
    for user in archive.users():
        elastic.add(INDEX, user['id'], user)


def index_messages(archive, elastic, min_date=None, max_date=None):
    users = archive.users_dict()
    users_banned_from_index = set()
    for message in archive.traverse(min_date=min_date, max_date=max_date):
        if 'user' not in message or message['user'] in users_banned_from_index:
            continue

        doc_id = message['channel'] + '_' + message['ts']
        message['username'] = users.get(message['user'], {}).get('name', 'UNKNOWN')
        message['millits'] = int(float(message['ts']) * 1000) # milliseconds since epoch

        elastic.bulk_push(
            INDEX,
            doc_id,
            message
        )

    elastic.bulk_commit()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--min-date')
    parser.add_argument('--max-date')
    parser.add_argument('root')
    parser.add_argument('mode', nargs='?', default='reindex', choices=['reindex', 'increment', 'initial'])

    args = parser.parse_args()

    def parse_if_defined(maybe_date_str):
        return datetime.strptime(maybe_date_str, '%Y-%m-%d').date() if maybe_date_str else None
    min_date = parse_if_defined(args.min_date)
    max_date = parse_if_defined(args.max_date)

    archive = SlackArchive(args.root)
    elastic = Elastic()

    if args.mode == 'reindex':
        elastic.delete_index(INDEX)
        elastic.create_index(INDEX)
    elif args.mode == 'initial':
        elastic.create_index(INDEX)

    #index_users(archive, elastic)
    index_messages(archive, elastic, min_date=min_date, max_date=max_date)

main()
