#!/usr/bin/env bash

set -e
g++ main.cpp
./a.out write
npx ts-node ././../../cli.ts tests/simple-structs/plain.bimo --target=ts --output=tests/simple-structs/plain-compiled
npx ts-node read.ts