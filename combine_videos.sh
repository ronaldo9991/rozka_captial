#!/bin/bash

# Combine herosectionvideo.mp4 and herosectionvideo2.mp4
# and replace agent vids.mp4

cd /root/mekness/client/public/videos

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is not installed. Installing..."
    apt-get update && apt-get install -y ffmpeg
fi

# Create a temporary file list for concatenation
echo "file 'herosectionvideo.mp4'" > filelist.txt
echo "file 'herosectionvideo2.mp4'" >> filelist.txt

# Combine the videos using concat demuxer (preserves quality better)
ffmpeg -f concat -safe 0 -i filelist.txt -c copy "agent vids.mp4" -y

# Clean up
rm filelist.txt

echo "Videos combined successfully! The combined video has replaced 'agent vids.mp4'"


