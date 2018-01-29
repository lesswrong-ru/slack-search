#!/bin/sh

set -e
yarn build
rsync --delete -r build/ slack.lesswrong.ru:/srv/slack-search/front/build
