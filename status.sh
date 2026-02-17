#!/bin/bash
# Status page generator - runs continuously in tmux window

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting status page generator...${NC}"
echo "Serving on http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""

# Create status directory if not exists
mkdir -p /tmp/status

while true; do
    # Generate timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    # Generate HTML
    cat > /tmp/status/index.html << 'EOF'
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0d1117;
            color: #c9d1d9;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #58a6ff;
            margin-bottom: 10px;
            font-size: 24px;
        }
        h2 {
            color: #8b949e;
            margin: 30px 0 15px 0;
            font-size: 18px;
            border-bottom: 1px solid #21262d;
            padding-bottom: 8px;
        }
        .timestamp {
            color: #8b949e;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .section {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 20px;
        }
        pre {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.5;
        }
        .empty {
            color: #6e7681;
            font-style: italic;
        }
        .status-ok {
            color: #3fb950;
        }
        .status-blocked {
            color: #f85149;
        }
        .status-steering {
            color: #d29922;
        }
        .refresh-info {
            color: #6e7681;
            font-size: 12px;
            text-align: center;
            margin-top: 30px;
        }
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            h1 {
                font-size: 20px;
            }
            h2 {
                font-size: 16px;
            }
            pre {
                font-size: 11px;
                padding: 12px;
            }
        }
    </style>
    <meta http-equiv="refresh" content="30">
</head>
<body>
    <div class="container">
        <h1>🤖 Claude Code Status</h1>
        <div class="timestamp">Last update: TIMESTAMP_PLACEHOLDER</div>

        <div class="section">
            <h2>📝 Live Log (Last 20 lines)</h2>
            <pre>LIVE_LOG_PLACEHOLDER</pre>
        </div>

        <div class="section">
            <h2 class="status-blocked">🛑 Blocked</h2>
            <pre>BLOCKED_PLACEHOLDER</pre>
        </div>

        <div class="section">
            <h2 class="status-steering">🎯 Steering</h2>
            <pre>STEERING_PLACEHOLDER</pre>
        </div>

        <div class="section">
            <h2>📊 Progress</h2>
            <pre>PROGRESS_PLACEHOLDER</pre>
        </div>

        <div class="section">
            <h2>🔄 Recent Commits</h2>
            <pre>GIT_LOG_PLACEHOLDER</pre>
        </div>

        <div class="refresh-info">
            Auto-refresh every 30 seconds
        </div>
    </div>
</body>
</html>
EOF

    # Read log files
    if [ -f "LIVE_LOG.md" ]; then
        LIVE_LOG=$(tail -20 LIVE_LOG.md | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
    else
        LIVE_LOG="<span class=\"empty\">No live log yet</span>"
    fi

    if [ -f "BLOCKED.md" ] && [ -s "BLOCKED.md" ]; then
        BLOCKED=$(cat BLOCKED.md | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
    else
        BLOCKED="<span class=\"empty status-ok\">✓ No blockers</span>"
    fi

    if [ -f "STEERING.md" ] && [ -s "STEERING.md" ]; then
        STEERING=$(cat STEERING.md | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
    else
        STEERING="<span class=\"empty\">No steering instructions</span>"
    fi

    if [ -f "PROGRESS.md" ]; then
        PROGRESS=$(cat PROGRESS.md | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
    else
        PROGRESS="<span class=\"empty\">No progress logged yet</span>"
    fi

    # Get git log
    if [ -d ".git" ]; then
        GIT_LOG=$(git log --oneline -10 2>/dev/null | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
        if [ -z "$GIT_LOG" ]; then
            GIT_LOG="<span class=\"empty\">No commits yet</span>"
        fi
    else
        GIT_LOG="<span class=\"empty\">Not a git repository</span>"
    fi

    # Replace placeholders
    sed -i "s|TIMESTAMP_PLACEHOLDER|$TIMESTAMP|g" /tmp/status/index.html
    sed -i "s|LIVE_LOG_PLACEHOLDER|$LIVE_LOG|g" /tmp/status/index.html
    sed -i "s|BLOCKED_PLACEHOLDER|$BLOCKED|g" /tmp/status/index.html
    sed -i "s|STEERING_PLACEHOLDER|$STEERING|g" /tmp/status/index.html
    sed -i "s|PROGRESS_PLACEHOLDER|$PROGRESS|g" /tmp/status/index.html
    sed -i "s|GIT_LOG_PLACEHOLDER|$GIT_LOG|g" /tmp/status/index.html

    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} Status page updated"

    # Serve with Python (works on most systems)
    if ! pgrep -f "python3.*http.server.*8080" > /dev/null; then
        cd /tmp/status
        python3 -m http.server 8080 > /dev/null 2>&1 &
        cd - > /dev/null
        echo -e "${GREEN}HTTP server started on port 8080${NC}"
    fi

    sleep 30
done
