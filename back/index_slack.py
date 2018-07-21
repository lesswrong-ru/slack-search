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

    def exists_index(self, index):
        code = requests.head(
            f'{self.endpoint}/{index}'
        ).status_code
        if code == 404:
            return False
        if code == 200:
            return True
        raise Exception(f"Error while checking if {index} exists")

    def delete_index(self, index):
        print(colored(f'Deleting index {index}', 'red'))
        requests.delete(
            '{}/{}'.format(self.endpoint, index)
        ).raise_for_status()

    def create_index(self, index):
        print(colored(f'Creating index {index}', 'green'))
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
                            'channel': {
                                'type': 'keyword',
                            },
                            'user': {
                                'type': 'keyword',
                            },
                            # username is not a keyword (should this be changed?), because it can be a full name like "John Doe"
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

    def create_alias(self, alias, index):
        print(colored('Creating alias {alias} for {index}', 'green'))
        requests.put(
            f'{self.endpoint}/{index}/_alias/{alias}'
        ).raise_for_status()

    def alias_targets(self, alias):
        r = requests.get(
            f'{self.endpoint}/*/_alias/{alias}'
        )
        r.raise_for_status()
        data = r.json()
        return list(data.keys())

    def switch_alias(self, alias, index):
        # the alias currently points to N old indices, let's remove them all
        actions = [
            {'remove': { 'index': index, 'alias': alias }}
            for index in self.alias_targets(alias)
        ]

        actions.append({
            'add': { 'index': index, 'alias': alias }
        })

        print(colored('Redirecting alias {alias} to {index}', 'green'))
        requests.post(
            f'{self.endpoint}/_aliases',
            json={'actions': actions}
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

        r = requests.post(
            '{}/_bulk'.format(self.endpoint),
            headers={
                'Content-Type': 'application/x-ndjson',
            },
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
        )
        r.raise_for_status()
        self._bulk_buffer = []


def index_users(archive, elastic, index):
    for user in archive.users():
        elastic.add(index, user['id'], user)


def index_messages(archive, elastic, index, min_date=None, max_date=None):
    users = archive.users_dict()
    users_banned_from_index = set()
    for message in archive.traverse(min_date=min_date, max_date=max_date):
        if 'user' not in message or message['user'] in users_banned_from_index:
            continue

        doc_id = message['channel'] + '_' + message['ts']
        message['username'] = users.get(message['user'], {}).get('name', 'UNKNOWN')
        message['millits'] = int(float(message['ts']) * 1000) # milliseconds since epoch

        elastic.bulk_push(
            index,
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

    INDEX_SLOTS = [f'slack.messages.{i}' for i in range(1,3)]
    ALIAS = 'slack.messages'

    def parse_if_defined(maybe_date_str):
        return datetime.strptime(maybe_date_str, '%Y-%m-%d').date() if maybe_date_str else None
    min_date = parse_if_defined(args.min_date)
    max_date = parse_if_defined(args.max_date)

    archive = SlackArchive(args.root)
    elastic = Elastic()

    if args.mode == 'initial':
        index = INDEX_SLOTS[0]
        elastic.create_alias(ALIAS, index)
    elif args.mode == 'reindex':
        used_indices = elastic.alias_targets()
        index = next(slot for slot in INDEX_SLOTS if slot not in used_indices)
        print(colored(f'{",".join(used_indices)} is used, indexing to {index}'), 'green')

    if elastic.exists_index(index):
        elastic.delete_index(index)

    elastic.create_index(index)

    index_messages(archive, elastic, index, min_date=min_date, max_date=max_date)

    elastic.switch_alias(alias, index)

main()
