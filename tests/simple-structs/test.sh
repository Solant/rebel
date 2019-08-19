#!/usr/bin/env bash

set -e

g++ main.cpp

./a.out write
NATIVE_READ=$(./a.out read)

npx ts-node ././../../cli.ts tests/simple-structs/plain.bimo --target=ts --output=tests/simple-structs/plain-compiled
BIMO_READ=$(npx ts-node read.ts)

if [ "$NATIVE_READ" = "$BIMO_READ" ]; then
  echo "equal"
else
  echo "bimo read is not equal to native"
  exit 1
fi