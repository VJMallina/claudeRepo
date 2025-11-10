# Claude CLI Troubleshooting Guide

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

## Quick Reference

### Emergency Reset

```bash
# Nuclear option - removes all Claude project history
rm -rf ~/.claude/projects/*
rm -rf ~/.claude/sessions/*
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
