#!/usr/bin/env bash
# shellcheck shell=bash
#
# Core utilities for hooks
#

# `npkg` – finds first available Node package manager and wraps it for common
# syntax so it can be used for scripts.
#
# **Usage:**
# ```sh
# npkg {add|run|test|install} [ARGS] 
# ```
# shellcheck disable=SC2317
npkg() {
    local PKG SUPPORT;
    # A path to Node.js package manager.
    PKG="$(command -v npm || command -v yarn || command -v pnpm || echo false)";
    # A list of supported package manager commands
    SUPPORT=(install test run add);
    _install() {
        case "${PKG##*/}" in
            "npm"|"yarn"|"pnpm") printf "install";;
            *) return 127;;
        esac
    }
    _test() {
        case "${PKG##*/}" in
            "npm"|"yarn"|"pnpm") printf "test";;
            *) return 127;;
        esac
    }
    _run() {
        case "${PKG##*/}" in
            "npm"|"yarn"|"pnpm") printf "run";;
            *) return 127;;
        esac
    }
    _add() {
        case "${PKG##*/}" in
            "npm"|"pnpm") printf "install";;
            "yarn") printf "add";;
            *) return 127;;
        esac
    }
    # Syntax checks.
    {
        # Unknown package manager (or lack of it).
        if [[ "$PKG" == "false" ]]; then
            echo "npkg: Couldn't find any supported Node manager!" >&2
            echo "npkg: Search list:  1.npm  2.yarn  3.pnpm" >&2
            return 200
        fi
        # Lack of first argument
        if [[ -z "$1" ]]; then
            echo "npkg: No command specified!" >&2
            echo "npkg: Supported commands: ${SUPPORT[*]}!" >&2
            return 202
        fi
        local VALID=0
        for cmd in "${SUPPORT[@]}"; do
            [[ "$1" == "$cmd" ]] && VALID=1
        done
        if [[ $VALID == 0 ]]; then
            echo "npkg: Unknown command: '${1}'!" >&2
            echo "npkg: Supported commands: ${SUPPORT[*]}!" >&2
            return 127
        fi
    }
    printf '\n%s\n\n' "npkg: Selected package manager: '${PKG##*/}'."
    "$PKG" "$("_$1")" "${@:2}"
}

# `c_json` – `JSON.parse()` wrapper for BASH. Part of `core.sh`.
#
# **Usage:**
# ```sh
# c_json .[property] PATH
# ```
c_json() {
    local query file;
    if [[ "$1" == "." ]]; then
        query="";
    else
        query="$1";
    fi
    file="$(tr -d '\n' <<< "${2//'"'/'\\"'}")";
    node -e "console.log(JSON.parse(\"$file\")$query);";
    return $?;
}

# `c_svcom` – A SemVer comparassion for BASH.
#
# **Usage:**
# ```
# c_svcom ()
# ```
c_svcom() {
    local sedrule subvr_1 subvr_2 vtype;
    case "$1" in
        maj{,or})  vtype=1    ;;
        min{,ior}) vtype=2    ;;
        patch)     vtype=3    ;;
        *)         vtype="$1" ;;
    esac
    if [[ "$vtype" -lt 1 || "$vtype" -gt 3 ]]; then return 1; fi;
    sedrule="s/.*\([\^<]\)\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)/\1 \\$((vtype+1))/";
    mapfile -t subvr_1 < <(sed "$sedrule" <<< "$2");
    mapfile -t subvr_2 < <(sed "$sedrule" <<< "$3");
    if [[ "${subvr_1[0]}" != "${subvr_2[0]}" ]]; then return 2; fi;
    if [[ "${subvr_1[1]}" -gt "${subvr_2[1]}" ]]; then
        echo 1;
    elif [[ "${subvr_1[1]}" -eq "${subvr_2[1]}" ]]; then
        echo 0;
    elif [[ "${subvr_1[1]}" -lt "${subvr_2[1]}" ]]; then
        echo -1;
    fi
    return 3;
}