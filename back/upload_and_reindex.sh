#!/bin/bash
set -e

LOCAL_ZIP="$1"
HOST=slack.lesswrong.ru
DEPLOY_DIR=/srv/slack-search
scp "$1" $HOST:$DEPLOY_DIR/archive-new.zip
ssh $HOST "cd $DEPLOY_DIR && ./back/reindex_from_archive.sh ./archive-new.zip"
