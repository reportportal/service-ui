#!/usr/bin/env bash

#!/bin/bash -e

/etc/init.d/xvfb start && sleep 2

echo "Executing command $@"
exec "$@"
