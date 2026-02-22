Show current AEGIS status: run `bash scripts/health-check.sh` and display output.
Then show last 10 lines of LIVE_LOG.md.
Then show pending features: `jq '[.[]|select(.passes==false and .blocked==false)]|length' feature_list.json`
