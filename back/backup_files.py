#!/usr/bin/env python3
import requests
from datetime import datetime, timedelta

import boto3
import botocore

import os

from slackclient import SlackClient

SLACK_TOKEN = os.environ['SLACK_TOKEN']

S3_ACCESS_KEY = os.environ['S3_ACCESS_KEY']
S3_SECRET_KEY = os.environ['S3_SECRET_KEY']
S3_BUCKET_NAME = os.environ['S3_BUCKET_NAME']

s3 = boto3.resource(
    's3',
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
)
sc = SlackClient(SLACK_TOKEN)

def list_all_slack_files(dt_from, dt_to):
    page = 1

    while True:
        print('Page {}'.format(page))
        response = sc.api_call(
            'files.list',
            page=page,
            ts_from=dt_from.timestamp(),
            ts_to=dt_to.timestamp(),
        )
        if not response['ok']:
            raise Exception(response['error'])

        files = response['files']
        if not len(files):
            break

        for file_info in files:
            yield file_info

        page += 1

def fetch_and_upload_to_s3(file_info):
    key = file_info['id']
    url = file_info['url_private']
    print('Downloading url ' + url)
    r = requests.get(
        url, headers={
            'Authorization': 'Bearer ' + SLACK_TOKEN
        }
    )
    r.raise_for_status()
    data = r.content

    s3.Bucket(S3_BUCKET_NAME).put_object(Key=key, Body=data)

def delete_file_from_slack(file_info):
    key = file_info['id']
    response = sc.api_call('files.delete', file=key)
    if not response['ok']:
        print('{} - error: {}'.format(key, response['error']))
        return
    print('{} deleted from slack'.format(key))

def store_file_to_s3(file_info):
    if 'url_private_download' not in file_info:
        if 'google.com/' in file_info['url_private'] or 'gist.github.com' in file_info['url_private']:
            # not a real file, that's ok
            return
        else:
            raise Exception("Bad file " + file_info['url_private'])

    key = file_info['id']

    try:
        s3.Object(S3_BUCKET_NAME, key).load()
        print('{} already exists'.format(key))
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] != "404":
            raise

        # The object does not exist.
        fetch_and_upload_to_s3(file_info)

    delete_file_from_slack(file_info)

def main():
    dt_start = datetime(2015,1, 1)
    dt_end = datetime(2018, 1, 1)
    dt_step = timedelta(days=30)

    dt_from = dt_start

    while dt_from < dt_end:
        dt_to = dt_from + dt_step
        if dt_to > dt_end:
            dt_to = dt_end

        print("Backing up from {} to {}".format(dt_from, dt_to))

        for file_info in list_all_slack_files(dt_from=dt_from, dt_to=dt_to):
            store_file_to_s3(file_info)

        dt_from = dt_to

if __name__ == '__main__':
    main()
