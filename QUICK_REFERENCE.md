# Quick Reference - SSH & tmux Commands

## SSH vào WSL2
```bash
# Từ terminal local hoặc Termius
ssh thanh@ssh.ai-agent.io.vn
```

## tmux Commands

### Session Management
```bash
# Tạo session mới
tmux new -s bigtask

# Attach vào session
tmux attach -t bigtask
tmux a -t bigtask

# List sessions
tmux ls

# Kill session
tmux kill-session -t bigtask
```

### Trong tmux (Ctrl+B là prefix key)
```bash
# Detach (thoát nhưng giữ session chạy)
Ctrl+B, D

# Tạo window mới
Ctrl+B, C

# Switch giữa các windows
Ctrl+B, 0    # Window 0
Ctrl+B, 1    # Window 1
Ctrl+B, N    # Next window
Ctrl+B, P    # Previous window

# Rename window
Ctrl+B, ,

# Kill window hiện tại
Ctrl+B, &
```

### Scroll & Copy
```bash
# Vào scroll mode
Ctrl+B, [

# Trong scroll mode:
- Arrow keys: di chuyển
- Page Up/Down: cuộn nhanh
- Q: thoát scroll mode

# Copy mode:
Ctrl+B, [
Space         # Bắt đầu select
Arrow keys    # Di chuyển để select
Enter         # Copy
Ctrl+B, ]     # Paste
```

### Split Panes (optional)
```bash
# Split horizontal
Ctrl+B, "

# Split vertical
Ctrl+B, %

# Switch giữa panes
Ctrl+B, Arrow keys

# Close pane
Ctrl+D hoặc exit
```

## Workflow để chạy 4 ngày liên tục

### 1. Khởi động (lần đầu)
```bash
# SSH vào
ssh thanh@ssh.ai-agent.io.vn

# Tạo tmux session
tmux new -s bigtask

# Window 0: Chạy Claude Code
claude-code

# Tạo window mới cho status page
Ctrl+B, C

# Window 1: Chạy status page
cd /mnt/d/mm-new-pwa
./status.sh

# Switch về window 0
Ctrl+B, 0

# Detach
Ctrl+B, D

# Exit SSH
exit
```

### 2. Kiểm tra từ iPhone
```bash
# Mở Termius, connect vào WSL2 SSH
# Attach lại session
tmux a -t bigtask

# Xem Claude đang làm gì (window 0)
Ctrl+B, 0

# Xem status page (window 1)
Ctrl+B, 1

# Hoặc mở Safari: https://status.ai-agent.io.vn

# Detach khi xong
Ctrl+B, D
```

### 3. Steering (điều chỉnh hướng đi)
```bash
# SSH vào
ssh thanh@ssh.ai-agent.io.vn

# Edit STEERING.md
nano /mnt/d/mm-new-pwa/STEERING.md

# Viết hướng dẫn, ví dụ:
# [High Priority] Implement user authentication first
# Use Firebase Auth, not custom JWT

# Save: Ctrl+X, Y, Enter

# Claude sẽ tự động đọc và xóa file này sau mỗi task
```

### 4. Check progress
```bash
# Xem live log
tail -f /mnt/d/mm-new-pwa/LIVE_LOG.md

# Xem progress
cat /mnt/d/mm-new-pwa/PROGRESS.md

# Xem blockers
cat /mnt/d/mm-new-pwa/BLOCKED.md

# Hoặc xem qua status page: https://status.ai-agent.io.vn
```

## Troubleshooting

### tmux session mất
```bash
tmux ls
# Nếu không thấy "bigtask", tạo lại:
tmux new -s bigtask
```

### SSH không kết nối được
```bash
# Check SSH service trong WSL2
sudo service ssh status
sudo service ssh restart

# Check Cloudflare tunnel
cloudflared tunnel list
cloudflared tunnel info wsl-ssh
```

### Status page không hiển thị
```bash
# Check process
ps aux | grep python3 | grep 8080

# Restart status.sh
pkill -f "python3.*8080"
./status.sh
```

### WSL2 bị shutdown
```bash
# Từ PowerShell trên Windows
wsl

# Services sẽ tự động start nếu đã config /etc/wsl.conf
# Nếu không, chạy thủ công:
~/start-services.sh
```
