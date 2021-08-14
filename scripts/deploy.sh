#!/bin/bash

until ts-node src/Main.ts
do
    echo "Crashed... Restarting..."
    sleep 1
done