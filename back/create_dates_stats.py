#!/usr/bin/env python3

import argparse
import json
import glob
import os

try:
    from tqdm import tqdm
except ImportError:
    def tqdm(x):
        return x


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("archive_dir")

    args = parser.parse_args()

    dirs = glob.glob(os.path.join(args.archive_dir, '*', ''))
    for d in tqdm(dirs):
        files = []
        for f in sorted(glob.glob(os.path.join(d, '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].json'))):
            if f == 'dates.json':
                continue

            j = json.load(open(f))
            has_messages = False
            for item in j:
                if item.get('subtype', None) in ['channel_join', 'channel_left']:
                    has_messages = True
                    break
            files.append({
                'date': os.path.basename(f).split('.')[0],
                'has-messages': has_messages
            })
        json.dump(files, open(os.path.join(d, 'dates.json'), 'w'))


if __name__ == "__main__":
    main()
