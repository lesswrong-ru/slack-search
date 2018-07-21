#!/bin/bash
set -e

ZIP="$1"

if [[ -z "$ZIP" ]]; then
    echo "Zip file path is required"
fi

absname() {
    echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

ZIP=$(absname "$ZIP")

ROOT_DIR=$(absname $(dirname "$0")/..)

cd $ROOT_DIR

rm -rf archive-new
unzip "$ZIP" -d archive-new
. ./back/venv/bin/activate
./back/index_slack.py archive-new ${2:-reindex}
rm -rf archive-old && mv archive archive-old && mv archive-new archive
