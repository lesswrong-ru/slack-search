#!/usr/bin/env python3

import argparse
import os
from datetime import datetime
from termcolor import colored
from pprint import pprint
from collections import namedtuple, defaultdict

from slackclient import SlackClient

from lwslack import SlackArchive

VotingUser = namedtuple('VotingUser', ['name', 'id', 'suffrage'])

def collect_suffrage_data(root, suffrage_max_date, suffrage_min_messages):
    archive = SlackArchive(root)
    users = archive.users_dict()

    total_stats = defaultdict(int)

    for message in archive.traverse(max_date=suffrage_max_date):
        if message['type'] != 'message' or not 'user' in message:
            continue

        total_stats[message['user']] += 1

    result = {}

    for user_id in users.keys():
        suffrage = total_stats.get(user_id, 0) >= suffrage_min_messages
        voting_user = VotingUser(
            id=user_id,
            name=users[user_id]['name'],
            suffrage=suffrage,
        )
        result[user_id] = voting_user

    return result


def snippet(text):
    lines = text.split('\n')
    result = lines[0]
    if len(lines) > 2 or (len(lines) == 2 and lines[1] != ''):
        result += ' [...]'
    return result

def process_program(program, suffrage_data, sc):
    candidate = suffrage_data[program['user']]
    print(colored(candidate.name, 'red'), '\t', snippet(program['text']))

    score = 0
    for reaction in program.get('reactions', []):
        if reaction['name'] not in ('heavy_plus_sign', 'heavy_minus_sign', 'kinda_plus'):
            continue

        voters = []
        voters_line = []
        for voter_id in reaction['users']:
            voter = suffrage_data.get(voter_id, None)
            if not voter:
                voter_from_api = sc.api_call(
                    "users.info",
                    user=voter_id
                )
                voter = VotingUser(id=voter_id, name=voter_from_api['user']['name'], suffrage='newbie')

            if voter.id == candidate.id:
                voter = VotingUser(id=voter.id, name=voter.name, suffrage='self')

            voter_colors = {
                True: 'green',
                False: 'red',
                'newbie': 'white',
                'self': 'white',
            }

            voters.append(voter)
            voters_line.append(
                colored(voter.name, voter_colors[voter.suffrage])
            )
        legal_voters_count = len([v for v in voters if v.suffrage == True])

        if reaction['name'] == 'heavy_plus_sign':
            delta = legal_voters_count
        elif reaction['name'] == 'heavy_minus_sign':
            delta = -legal_voters_count * 0.25
        elif reaction['name'] == 'kinda_plus':
            delta = legal_voters_count * 0.5

        print('{reaction} ({delta}): {voters}'.format(
            reaction=reaction['name'],
            delta=delta,
            voters=', '.join(voters_line)
        ))

        score += delta

    print(colored(score, color='green', attrs=['bold']))
    print()

    return (candidate.name, score)

def process_all_programs(programs, suffrage_data, sc):
    user2score = {}

    for program in programs:
        (user, score) = process_program(program, suffrage_data, sc)
        if user not in user2score:
            user2score[user] = score
        else:
            if user2score[user] < score:
                user2score[user] = score

    for k in sorted(user2score, key=user2score.get, reverse=True):
        print('{:20s}\t{:5.2f}'.format(k, user2score[k]))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--suffrage-max-date', default='2017-09-15')
    parser.add_argument('--suffrage-min-messages', default=200, type=int)
    parser.add_argument('--elections-start-date')
    parser.add_argument('root')

    args = parser.parse_args()
    suffrage_max_date = datetime.strptime(args.suffrage_max_date, '%Y-%m-%d').date()
    suffrage_min_messages = args.suffrage_min_messages
    elections_start_date = datetime.strptime(args.elections_start_date, '%Y-%m-%d').date()

    sc = SlackClient(os.environ["SLACK_API_TOKEN"])

    response = sc.api_call(
        "channels.history",
        channel="C737YGU8L",
        oldest=datetime.combine(elections_start_date, datetime.min.time()).timestamp(),
        count=1000,
    )

    if response['has_more']:
        raise Exception("Too many messages and paging is not implemented.")
    if response.get('is_limited', False):
        raise Exception("Some messages are beyond out of reach because of free team message limit.")

    messages = response['messages']

    # filter out thread messages
    programs = reversed([
        m for m in messages
        if m.get('thread_ts', m['ts']) == m['ts']
        and m.get('subtype', '') not in ('channel_join', 'channel_leave', 'pinned_item')
    ])

    suffrage_data = collect_suffrage_data(args.root, suffrage_max_date, suffrage_min_messages)

    process_all_programs(programs, suffrage_data, sc)

if __name__ == '__main__':
    main()
