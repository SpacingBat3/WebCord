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
function npkg() {
    echo "$0";
    local PKG;
    local SUPPORT;
    # A path to Node.js package manager.
    PKG="$(command -v npm || command -v yarn || command -v pnpm || echo "false")";
    # A list of supported package manager commands
    SUPPORT=(install test run add);
    function _install() {
        case "${PKG##*/}" in
            "npm"|"yarn"|"pnpm") printf "install";;
            *) return 127;;
        esac
    }
    function _test() {
        case "${PKG##*/}" in
            "npm"|"yarn"|"pnpm") printf "test";;
            *) return 127;;
        esac
    }
    function _run() {
        case "${PKG##*/}" in
            "npm"|"yarn"|"pnpm") printf "run";;
            *) return 127;;
        esac
    }
    function _add() {
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
# `lftest` – Tests if lockfile passes tests that allows for it to be commited.
#
# **Usage:**
# ```sh
# lftest # Does not use any arguments.
# ```
function lftest () {
    mapfile -t FILES < <(git diff --staged --name-only);
    local no_meta no_lock;
    unset -v no_lock no_meta;
    for file in "${FILES[@]}"; do
        if [[ "$file" == "package-lock.json" ]]; then
            no_lock=true;
        elif [[ "$file" == "package.json" ]]; then
            no_meta=true;
        fi
        [[ $no_lock && $no_meta ]] && break;
    done;
    if [[ "$no_meta" != "$no_lock" ]]; then
        printf '\n%s (%s)\n\n' \
            "locktest: test failed!" \
            "you need to commit both package-lock.json and package.json" >&2
        return 1;
    fi
}