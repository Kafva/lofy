#!/usr/bin/env bash
: '''
Download subsetter font, this will search the codebase
for nerdont icons that are in use and create a smaller
font file that only include the glyphs we actually use.
'''
die() { printf "$1\n" >&2 && exit 1; }

GENFONT_URL="https://gist.githubusercontent.com/Kafva/764264be4e233de7e855703d787e74b4/raw/e202c618db4f8ec59e82b0b243116a026f0291eb/genfont.sh"
GLYPH_INDEX_URL="https://gist.githubusercontent.com/Kafva/70ac5ba7704e469ae7b2b94f48a284a4/raw/d248ee9f8a46258df261540264332c8b3660a342/nerdfonts.raw"
GENFONT=/tmp/genfont.sh
GLYPH_INDEX=/tmp/nerdonts.raw

curl -Ls "$GENFONT_URL" > $GENFONT || die "Failed to fetch $GENFONT"
curl -Ls "$GLYPH_INDEX_URL" > $GLYPH_INDEX || die "Failed to fetch $GLYPH_INDEX"
chmod +x $GENFONT

# The generated font and CSS is put under ./client and included into
# vite's build process, i.e. we will get a font-XXXXX.ttf file under dist.
ASSETS_ENDPOINT="/client" \
    FONT_FAMILY="JetBrains-NF" \
    GLYPH_INDEX="$GLYPH_INDEX" \
    $GENFONT ./client \
    ./misc/JetBrains-NF.ttf \
    ./client/lofy-nerd-fonts.ttf \
    ./client/nerd-fonts.min.css
