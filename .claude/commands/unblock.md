Unblock a feature: set retry_count=0 and blocked=false for feature ID $ARGUMENTS in feature_list.json.
Use jq to update: `jq '[.[] | if .id == ($id|tonumber) then .blocked=false | .retry_count=0 else . end]' feature_list.json`
Log to LIVE_LOG.md: "[HH:MM] UNBLOCKED: feature #$ARGUMENTS — reset for retry"
