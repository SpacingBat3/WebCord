#!/bin/bash
SOURCES="$(readlink -f "$(dirname "$(which "$0")")/../..")";
case "$(uname -m)" in
	'x86_64')                  HOST='x64'         ;;
	'x86'|'i'?'86'|'pentium4') HOST='ia32'        ;;
	'armv7h')                  HOST='armv7l'      ;;
	'aarch64')                 HOST='arm64'       ;;
	'mips'*)                   HOST='mips64el'    ;;
	*)                         exit 1 ;; # Packaging not supported yet.
esac;
ARCH=("x64" "ia32" "armv7l" "arm64");

# Makers that can be used to cross-package on any host arch:
MAKERS=("electron-forge-maker-appimage"  # AppImage maker
        "@electron-forge/maker-deb"); # DEB package maker

# Publish native packages:
GITHUB_TOKEN="${GITHUB_TOKEN}" src="$SOURCES" args="$@" \
bash -c 'cd "$src"; npm run publish -- $args';

# Publish non-native packages:
err=0
for maker in "${MAKERS[@]}"; do
	[[ -z "$maker_list" ]] || maker_list="${maker_list},";
	maker_list="${maker_list}${maker}";
done;
for cpu_arch in "${ARCH[@]}"; do
	[[ "$cpu_arch" == "$HOST" || "$err" != 0 ]] && break;
	GITHUB_TOKEN="${GITHUB_TOKEN}" makers="$maker_list" arch="$cpu_arch" \
	src="$SOURCES" args="$@" \
	bash -c 'cd "$src"; npm run publish -- -p linux -a "$arch" --targets "$makers" $args';
	err=$?;
done;
[[ "$err" != 0 ]] && echo "Error code: \"${err}\"."
exit $err;