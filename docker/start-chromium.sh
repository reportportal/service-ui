#!/bin/bash

_kill_procs() {
  kill -TERM $chromium
  wait $chromium
  kill -TERM $xvfb
}

# Setup a trap to catch SIGTERM and relay it to child processes
trap _kill_procs SIGTERM

XVFB_WHD=${XVFB_WHD:-1280x720x16}

# Start Xvfb
Xvfb :99 -ac -screen 0 $XVFB_WHD +extension RANDR -nolisten tcp &
xvfb=$!

export DISPLAY=:99

xvfb-run chromium $@ &
chromium=$!

wait $chromium
wait $xvfb
