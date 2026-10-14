#!/bin/bash
# Execute act
#   --secret-file load .secrets 
#   --reuse allows Docker container reuse between runs
./bin/act \
    --secret-file .secrets 
    # --reuse 
    # --verbose