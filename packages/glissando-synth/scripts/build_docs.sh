#!/bin/zsh

echo "building docs..."

for mermaid_file in docs/*.mmd
do
  name=${mermaid_file:5:-4}
  mmdc -i $mermaid_file -o docs/${name}.svg
done

echo "done 👽"