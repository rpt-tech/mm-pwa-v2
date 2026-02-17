# WSL2 Restart & Troubleshooting Guide

## Restart WSL2

### Từ PowerShell trên Windows (Run as Admin):
```powershell
# Shutdown WSL2
wsl --shutdown

# Start lại
wsl

# Hoặc start với distro cụ thể
wsl -d Ubuntu
```

### Sau khi restart, verify services:
```bash
# Check SSH
sudo service ssh status

# Check Cloudflare Tunnel
pgrep -f cloudflared

# Nếu chưa chạy, start thủ công:
~/start-services.sh
```

---

## Troubleshooting SSH Connection

### 1. Trong WSL2, check SSH service:
```bash
# Check status
sudo service ssh status

# Start nếu chưa chạy
sudo service ssh start

# Check port 22
sudo netstat -tlnp | grep :22
# hoặc
sudo ss -tlnp | grep :22
```

### 2. Check Cloudflare Tunnel:
```bash
# Check process
ps aux | grep cloudflared

# Check log
tail -f /tmp/cloudflared.log

# Nếu không chạy, start thủ công:
cloudflared tunnel run wsl-ssh &

# Verify tunnel connected
# Đợi vài giây, nếu thấy "Registered tunnel connection" là OK
```

### 3. Test SSH local trước:
```bash
# Test từ trong WSL2
ssh thanh@localhost

# Nếu OK → vấn đề ở Cloudflare Tunnel
# Nếu FAIL → vấn đề ở SSH service
```

### 4. Test Cloudflare Tunnel:
```bash
# Check tunnel info
cloudflared tunnel info wsl-ssh

# Run tunnel foreground để xem log
cloudflared tunnel run wsl-ssh
# Nhấn Ctrl+C để stop, rồi chạy background:
cloudflared tunnel run wsl-ssh > /tmp/cloudflared.log 2>&1 &
```

### 5. Từ máy khác (hoặc dùng curl trong WSL2):
```bash
# Test DNS resolve
nslookup ssh.ai-agent.io.vn

# Test connection
curl -v https://ssh.ai-agent.io.vn
```

---

## Common Issues

### Issue: "Connection refused"
**Nguyên nhân:** SSH service chưa chạy
**Fix:**
```bash
sudo service ssh start
```

### Issue: "Connection timeout"
**Nguyên nhân:** Cloudflare Tunnel chưa chạy hoặc DNS chưa propagate
**Fix:**
```bash
# Start tunnel
cloudflared tunnel run wsl-ssh &

# Đợi 1-2 phút cho DNS propagate
# Test lại
```

### Issue: "Permission denied (publickey)"
**Nguyên nhân:** SSH key không đúng hoặc authorized_keys sai
**Fix:**
```bash
# Check authorized_keys
cat ~/.ssh/authorized_keys

# Nếu trống, add lại public key:
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Issue: WSL2 không auto-start services
**Nguyên nhân:** /etc/wsl.conf chưa đúng hoặc script không executable
**Fix:**
```bash
# Check wsl.conf
cat /etc/wsl.conf

# Nếu chưa có, tạo:
sudo tee /etc/wsl.conf << 'EOF'
[boot]
command = /home/thanh/start-services.sh
EOF

# Check script executable
ls -la ~/start-services.sh
chmod +x ~/start-services.sh

# Test script
~/start-services.sh
```

---

## Quick Diagnostic Commands

```bash
# All-in-one check
echo "=== SSH Service ==="
sudo service ssh status

echo ""
echo "=== SSH Port ==="
sudo ss -tlnp | grep :22

echo ""
echo "=== Cloudflare Tunnel ==="
ps aux | grep cloudflared | grep -v grep

echo ""
echo "=== Tunnel Log (last 10 lines) ==="
tail -10 /tmp/cloudflared.log

echo ""
echo "=== Test Local SSH ==="
ssh -o ConnectTimeout=5 thanh@localhost echo "SSH OK" 2>&1
```

---

## Manual Start (nếu auto-start fail)

```bash
# Start SSH
sudo service ssh start

# Start Cloudflare Tunnel
cloudflared tunnel run wsl-ssh > /tmp/cloudflared.log 2>&1 &

# Verify
sleep 3
ps aux | grep cloudflared | grep -v grep
tail -5 /tmp/cloudflared.log
```

---

## Termius Connection Settings

**Double-check trong Termius:**
- Hostname: `ssh.ai-agent.io.vn` (KHÔNG phải localhost)
- Port: `22`
- Username: `thanh`
- Authentication: SSH Key (private key đã import)

**Test từ terminal trước khi dùng Termius:**
```bash
ssh thanh@ssh.ai-agent.io.vn
```

Nếu terminal OK mà Termius fail → check lại SSH key trong Termius.
