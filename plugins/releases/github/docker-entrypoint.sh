export DRONE_BUILD_EVENT=tag

export INPUT_REPO=${INPUT_REPO:-${PCIT_REPO_SLUG}}
export DRONE_REPO_OWNER=$(echo $INPUT_REPO | cut -d "/" -f 1)
export DRONE_REPO_NAME=$(echo $INPUT_REPO | cut -d "/" -f 2)
export DRONE_COMMIT_REF=${INPUT_TARGET_COMMITISH:-${PCIT_COMMIT}}
export PLUGIN_API_KEY=${INPUT_TOKEN:-${INPUT_API_KEY}}
export PLUGIN_FILES=${INPUT_FILES}
export PLUGIN_FILE_EXISTS=${INPUT_FILE_EXISTS:-overwrite}
if [ -n "${INPUT_CHECKSUM}" ];then export PLUGIN_CHECKSUM=${INPUT_CHECKSUM} ; fi
export PLUGIN_DRAFT=${INPUT_DRAFT:-false}
export PLUGIN_PRERELEASE=${INPUT_PRERELEASE:-false}
if [ -n "${INPUT_NOTE}" ];then export PLUGIN_NOTE=${INPUT_NOTE} ; fi
if [ -n "${INPUT_TITLE}"];then export PLUGIN_TITLE=${INPUT_TITLE} ; fi
export PLUGIN_OVERWRITE=${INPUT_OVERWRITE:-false}

exec /bin/drone-github-release
