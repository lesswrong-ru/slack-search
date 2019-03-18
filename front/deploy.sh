#!/bin/sh

set -e
npm run build
rsync --delete -r build/ slack.lesswrong.ru:/srv/slack-search/front/build
