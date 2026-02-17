# Setup Guide - Claude Code CLI 4 ngày liên tục

## 1. ✓ Tắt sleep Windows (ĐÃ HƯỚNG DẪN)

Chạy trong PowerShell (Run as Administrator):
```powershell
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /change disk-timeout-ac 0
powercfg /hibernate off
```

---

## 2. SSH Server trên WSL2

### Cài đặt và config:
```bash
# Cài OpenSSH
sudo apt update
sudo apt install -y openssh-server

# Backup config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Config SSH
sudo sed -i 's/#Port 22/Port 22/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

# Start SSH
sudo service ssh start

# Enable auto-start
sudo tee /etc/wsl.conf << EOF
[boot]
command = service ssh start
EOF
```

### SSH Keys (ĐÃ CÓ SẴN):
**Public key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGAWSH0O2Gs5mwsPB4lXde1XWBnOJnDIfsSST3QaQb7a
```

**Private key:** (đã hiển thị ở output trên - copy vào Termius)

### Test local:
```bash
ssh -i ~/.ssh/id_ed25519 thanh@localhost
```

---

## 3. tmux

### Cài đặt:
```bash
sudo apt install -y tmux
```

### Tạo session:
```bash
tmux new -s bigtask
```

### Các lệnh cơ bản:
```bash
# Detach (thoát nhưng giữ session chạy)
Ctrl+B, D

# Attach lại
tmux attach -t bigtask
# hoặc
tmux a -t bigtask

# List sessions
tmux ls

# Scroll mode
Ctrl+B, [
# Dùng arrow keys hoặc Page Up/Down
# Nhấn Q để thoát scroll mode

# Copy mode
Ctrl+B, [
# Di chuyển đến vị trí bắt đầu
Space (bắt đầu select)
# Di chuyển đến vị trí kết thúc
Enter (copy)
Ctrl+B, ] (paste)

# Kill session
tmux kill-session -t bigtask
```

### Config tmux (optional):
```bash
cat > ~/.tmux.conf << 'EOF'
# Mouse support
set -g mouse on

# Increase scrollback
set -g history-limit 50000

# Start windows at 1
set -g base-index 1

# Status bar
set -g status-style bg=black,fg=white
set -g status-right '%Y-%m-%d %H:%M'
EOF
```

---

## 4. Cloudflare Tunnel

### Cài cloudflared:
```bash
# Download
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify
cloudflared --version
```

### Login và tạo tunnel:
```bash
# Login (sẽ mở browser)
cloudflared tunnel login

# Tạo tunnel
cloudflared tunnel create wsl-ssh

# Lưu tunnel ID (sẽ hiển thị sau khi tạo)
```

### Config tunnel:
```bash
# Tạo config file
mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: wsl-ssh
credentials-file: /home/thanh/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: ssh.ai-agent.io.vn
    service: ssh://localhost:22
  - hostname: status.ai-agent.io.vn
    service: http://localhost:8080
  - service: http_status:404
EOF
```

**LƯU Ý:** Thay `<TUNNEL_ID>` bằng ID thực tế từ lệnh `cloudflared tunnel create`

### Tạo DNS record:
```bash
cloudflared tunnel route dns wsl-ssh ssh.ai-agent.io.vn
cloudflared tunnel route dns wsl-ssh status.ai-agent.io.vn
```

### Test tunnel:
```bash
cloudflared tunnel run wsl-ssh
```

### Auto-start tunnel:
```bash
# Thêm vào ~/start-services.sh
cat > ~/start-services.sh << 'EOF'
#!/bin/bash
sudo service ssh start
cloudflared tunnel run wsl-ssh &
echo "SSH and Cloudflare Tunnel started"
EOF

chmod +x ~/start-services.sh

# Update /etc/wsl.conf
sudo tee /etc/wsl.conf << EOF
[boot]
command = /home/thanh/start-services.sh
EOF
```

### Test từ local:
```bash
ssh thanh@ssh.ai-agent.io.vn
```

---

## 5. CLAUDE.md cho project

File này đã được tạo sẵn: `CLAUDE.md`

---

## 6. Status page

File script đã được tạo sẵn: `status.sh`

### Chạy status page:
```bash
# Trong tmux session, tạo window mới
Ctrl+B, C

# Chạy status script
./status.sh

# Switch về window đầu
Ctrl+B, 0
```

---

## 7. Termius config

### Trên iPhone:
1. Mở Termius
2. Tap "+" → New Host
3. Nhập:
   - **Alias:** WSL2 SSH
   - **Hostname:** ssh.ai-agent.io.vn
   - **Port:** 22
   - **Username:** thanh
4. Tap "Keys" → "+" → "Import"
5. Paste private key (từ output setup-ssh.sh)
6. Save

---

## 8. Test end-to-end

### Từ terminal local:
```bash
# Test SSH
ssh thanh@ssh.ai-agent.io.vn

# Trong SSH session:
tmux attach -t bigtask

# Detach
Ctrl+B, D

# Exit SSH
exit
```

### Từ iPhone (Termius):
1. Tap vào host "WSL2 SSH"
2. Kết nối
3. Chạy: `tmux attach -t bigtask`
4. Detach: Ctrl+B, D (dùng keyboard Termius)

### Kiểm tra status page:
- Mở Safari trên iPhone
- Vào: `https://status.ai-agent.io.vn`

---

## Checklist cuối cùng

- [ ] Windows không sleep khi cắm điện
- [ ] SSH service chạy trong WSL2
- [ ] SSH key-based auth hoạt động
- [ ] tmux session "bigtask" đã tạo
- [ ] Cloudflare tunnel chạy
- [ ] ssh.ai-agent.io.vn kết nối được
- [ ] status.ai-agent.io.vn hiển thị được
- [ ] Termius trên iPhone kết nối được
- [ ] CLAUDE.md đã tạo
- [ ] status.sh chạy trong tmux window riêng

---

## Troubleshooting

### SSH không start:
```bash
sudo service ssh status
sudo service ssh restart
```

### Cloudflare tunnel không chạy:
```bash
cloudflared tunnel list
cloudflared tunnel info wsl-ssh
# Check logs
journalctl -u cloudflared
```

### WSL2 không auto-start services:
```bash
# Check wsl.conf
cat /etc/wsl.conf

# Restart WSL từ PowerShell:
wsl --shutdown
wsl
```

### tmux session mất:
```bash
tmux ls
# Nếu không có session, tạo lại:
tmux new -s bigtask
```
