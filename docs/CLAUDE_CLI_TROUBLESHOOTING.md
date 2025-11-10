# Claude CLI Troubleshooting Guide

## 🚨 CRITICAL: WSL Filesystem Corruption

### Problem Description

If you're getting I/O errors on **basic commands** like `cp`, `ls`, or other system binaries:

```
-bash: /usr/bin/cp: Input/output error
-bash: /usr/local/bin/claude: Input/output error
```

This indicates **WSL-wide filesystem corruption**, not just Claude CLI issues. This requires immediate WSL recovery.

### Immediate Recovery Steps

#### Step 1: Restart WSL (Try This First)

From **Windows PowerShell (Run as Administrator)**:

```powershell
# Shutdown WSL completely
wsl --shutdown

# Wait 10 seconds, then restart WSL
wsl
```

Test if basic commands work:
```bash
ls -la
cp --version
```

#### Step 2: If Still Broken - Check WSL Disk

```powershell
# Check WSL disk integrity
wsl --manage <distro-name> --set-sparse true

# List your distros
wsl --list --verbose

# Example: For Ubuntu
wsl --manage Ubuntu --set-sparse true
```

#### Step 3: Nuclear Option - Reinstall WSL Distribution

**⚠️ WARNING: This will DELETE all data in WSL. Backup important files first!**

From Windows PowerShell:

```powershell
# 1. Export your WSL distro (backup)
wsl --export Ubuntu C:\backup\ubuntu-backup.tar

# 2. Unregister the corrupted distro
wsl --unregister Ubuntu

# 3. Reinstall Ubuntu from Microsoft Store
# Or import from backup:
wsl --import Ubuntu C:\WSL\Ubuntu C:\backup\ubuntu-backup.tar
```

#### Step 4: Reinstall Node.js and Claude CLI

Once WSL is working again:

```bash
# Reinstall Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Reinstall Claude CLI
sudo npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

### Prevention

1. **Never forcefully kill WSL processes** - always use `wsl --shutdown`
2. **Avoid working directly on Windows drives** (`/mnt/c/...`) - copy to Linux filesystem first
3. **Regular backups**: Use `wsl --export` to backup your distribution
4. **Keep WSL updated**: Run `wsl --update` regularly

---

## I/O Error: Path Handling in WSL

### Problem Description

When running Claude CLI from a Windows directory in WSL (Windows Subsystem for Linux), you may encounter this error:

```
Error: EIO: i/o error, open '/home/user/.claude/projects/-mnt-c-Users-user-Desktop-StandupSnap/...'
```

Notice the malformed path: `-mnt-c-Users-user-Desktop-StandupSnap` (missing leading slash).

### Root Cause

Claude CLI incorrectly stores project paths when invoked from Windows mount points (`/mnt/c/...`) in WSL, leading to corrupted session data in `~/.claude/projects/`.

### Quick Fix

Run these commands to clean up corrupted project data and fix the issue:

```bash
# 1. Clean up corrupted Claude project data
rm -rf ~/.claude/projects/-mnt-*

# 2. Optional: Clean all project history (fresh start)
# rm -rf ~/.claude/projects/*

# 3. Verify cleanup
ls -la ~/.claude/projects/
```

### Solutions

#### Option 1: Use Native Linux Paths (Recommended)

Instead of running Claude from `/mnt/c/...`, copy or clone your project to a native Linux directory:

```bash
# Copy project to home directory
cp -r /mnt/c/Users/user/Desktop/StandupSnap ~/StandupSnap
cd ~/StandupSnap
claude
```

Or create a symlink:

```bash
ln -s /mnt/c/Users/user/Desktop/StandupSnap ~/StandupSnap
cd ~/StandupSnap
claude
```

#### Option 2: Clean and Continue from Windows Path

If you must work from the Windows directory:

```bash
# Clean corrupted data
rm -rf ~/.claude/projects/-mnt-*

# Navigate to your Windows project
cd /mnt/c/Users/user/Desktop/StandupSnap

# Start Claude CLI again
claude
```

**Note:** You may need to repeat the cleanup if the issue persists.

#### Option 3: WSL Restart

Sometimes WSL filesystem issues require a restart:

```powershell
# From Windows PowerShell
wsl --shutdown
```

Then restart your WSL terminal and try again.

### Prevention

1. **Work from Linux paths**: Always prefer `~/<project>` over `/mnt/c/<path>`
2. **Use Git**: Clone repositories directly in WSL's Linux filesystem
3. **Project location**: Keep development projects in `~/projects/` or similar

### Verification

After applying fixes, verify Claude CLI works:

```bash
cd ~/your-project
claude --version
claude
```

### Additional WSL Issues

#### Permission Errors

If you encounter permission errors with files in `/mnt/c/`:

```bash
# Add to ~/.wslconfig (Windows side: C:\Users\<username>\.wslconfig)
[automount]
options = "metadata,umask=22,fmask=11"
```

#### Slow Performance

Windows filesystem access from WSL is slower. Use native Linux filesystem for better performance:

```bash
# Check if you're on Windows or Linux filesystem
df -h .

# /mnt/c/... = Windows (slower)
# /home/... = Linux (faster)
```

### Related Commands

```bash
# View all Claude projects
ls -la ~/.claude/projects/

# Check disk space
df -h ~/.claude/

# View Claude CLI location
which claude

# Reinstall Claude CLI if corrupted
sudo npm uninstall -g @anthropic-ai/claude-code
sudo npm install -g @anthropic-ai/claude-code
```

## Other Common Issues

### Bus Error (Core Dumped)

The "Bus error (core dumped)" at the end indicates a critical failure. This typically happens after multiple failed I/O attempts.

**Solution**: Follow the cleanup steps above and restart your terminal.

### Unhandled Promise Rejection

The error mentions "promise rejected with reason" - this is a Claude CLI bug that should handle filesystem errors more gracefully, but the underlying issue is the path handling problem.

---

## Diagnostic Guide

### How to Identify Your Issue

Run these tests to determine the severity:

```bash
# Test 1: Basic commands
ls -la
echo "test"
cp --version

# Test 2: File operations
touch /tmp/test.txt
rm /tmp/test.txt

# Test 3: Claude CLI
claude --version
```

**Decision Tree:**

1. **If basic commands fail** (`ls`, `cp`, `echo`) → You have **WSL filesystem corruption** → Follow "CRITICAL: WSL Filesystem Corruption" section above
2. **If only Claude CLI fails** → You have **Claude CLI specific issue** → Follow "I/O Error: Path Handling in WSL" section
3. **If file operations fail on `/mnt/c/`** → Windows drive mount issue → See "Additional WSL Issues" section

---

## Quick Reference

### Emergency Reset

**For Claude CLI Issues:**
```bash
# Remove Claude project history
rm -rf ~/.claude/projects/*
rm -rf ~/.claude/sessions/*
```

**For WSL Issues:**
```powershell
# From Windows PowerShell (as Administrator)
wsl --shutdown
# Wait 10 seconds, then restart
wsl
```

**For Complete WSL Corruption:**
```powershell
# Backup first!
wsl --export Ubuntu C:\backup\ubuntu-backup.tar
# Then reinstall (see full steps in "CRITICAL" section above)
wsl --unregister Ubuntu
```

### Healthy Project Structure

```
~/.claude/
├── projects/
│   └── home-user-StandupSnap/    ✅ Correct format
│       └── session-id.jsonl
└── config.json
```

### Corrupted Project Structure

```
~/.claude/
├── projects/
│   └── -mnt-c-Users-user-Desktop-StandupSnap/    ❌ Malformed path
│       └── session-id.jsonl
```

---

**Need more help?** Report issues at: https://github.com/anthropics/claude-code/issues
