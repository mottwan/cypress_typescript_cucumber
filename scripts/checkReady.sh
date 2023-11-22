#!/bin/bash

declare file_path=$1
declare -i limit=${2-:30}
declare -i counter=0

while [ ! -f "$file_path" ] ;
do
  ((counter++))
  if ((counter > limit)); then
    printf "Was not able to find $file_path in $limit seconds.\n"
    exit 1;
  else
      sleep 1
  fi
done

printf "Found file $file_path in $counter seconds. \n"
rm "$file_path"
exit 0;