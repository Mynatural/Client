#!/bin/bash
# on Mac OSX 10.11+

INFO_NAME='info.json'

encode() {
    src=$1
    dst=$2
    echo "encoding $src -> $dst"
    cat "$src" | ruby -r erb -ne 'print ERB::Util.url_encode $_' | base64 > "$dst"
}

decode() {
    src=$1
    dst=$2
    echo "decoding $src -> $dst"
    cat "$src" | base64 -D | ruby -r cgi -ne 'print CGI.unescape $_' > "$dst"
}

upload() {
    dir=$1
    s3dir=$2
    find "$dir" -name "$INFO_NAME" | while read file
    do
        key=$(basename $(dirname "$file"))
        encode "$file" "${file}.encoded"
        aws s3 cp "${file}.encoded" "${s3dir}/${key}/${INFO_NAME}.encoded"
    done
}

download() {
    s3dir=$1
    dir=$2
    echo "Listing $s3dir"
    aws s3 ls "${s3dir}/" | grep PRE | awk '{print $2}' | while read key
    do
        path="${key}${INFO_NAME}.encoded"
        echo "Downloading $path"
        aws s3 cp "${s3dir}/${path}" "${dir}/${path}"
        decode "${dir}/${path}" "${dir}/${path%%\.encoded}"
    done
}

proc=$1
s3Bucket=$2

dir="./.lineup"
s3dir="s3://${s3Bucket}/unauthorized/lineup"

case "$proc" in
    "upload") upload "$dir" "$s3dir";;
    "download") download "$s3dir" "$dir";;
esac
