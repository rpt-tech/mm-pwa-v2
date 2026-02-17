#!/bin/bash
# Setup SSH server on WSL2

echo "=== Installing OpenSSH Server ==="
sudo apt update
sudo apt install -y openssh-server

echo ""
echo "=== Configuring SSH ==="
# Backup original config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Configure SSH
sudo sed -i 's/#Port 22/Port 22/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config

echo ""
echo "=== Creating SSH key pair ==="
mkdir -p ~/.ssh
chmod 700 ~/.ssh

if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "wsl2-ssh-key" -f ~/.ssh/id_ed25519 -N ""
    cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "✓ SSH key pair created"
else
    echo "✓ SSH key already exists"
fi

echo ""
echo "=== Your PUBLIC key (copy this to Termius) ==="
cat ~/.ssh/id_ed25519.pub
echo ""

echo "=== Your PRIVATE key (copy this to Termius) ==="
cat ~/.ssh/id_ed25519
echo ""

echo "=== Starting SSH service ==="
sudo service ssh start

echo ""
echo "=== Setting up auto-start ==="
# Create startup script
cat > ~/start-services.sh << 'EOF'
#!/bin/bash
sudo service ssh start
echo "SSH started on port 22"
EOF

chmod +x ~/start-services.sh

echo ""
echo "✓ SSH setup complete!"
echo ""
echo "Add this to your Windows startup (PowerShell as Admin):"
echo "wsl -d Ubuntu -u $USER ~/start-services.sh"
echo ""
echo "Or add to /etc/wsl.conf:"
echo "[boot]"
echo "command = service ssh start"
