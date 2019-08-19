#!/usr/bin/env bash

g++ main.cpp
./a.out
npx ts-node ././../../cli.ts tests/simple-structs/plain.bimo --target=ts --output=tests/simple-structs/plain-compiled
npx ts-node read.ts