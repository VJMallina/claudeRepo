#!/bin/bash

# Claude CLI I/O Error Fix Script
# Fixes the WSL path handling issue that causes EIO errors

set -e

echo "================================================"
echo "Claude CLI I/O Error Fix Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ~/.claude directory exists
if [ ! -d "$HOME/.claude" ]; then
    echo -e "${YELLOW}Warning: ~/.claude directory not found${NC}"
    echo "Claude CLI may not be installed or hasn't been run yet."
    exit 0
fi

# Check for corrupted project directories
echo "Checking for corrupted project directories..."
CORRUPTED_DIRS=$(find "$HOME/.claude/projects/" -maxdepth 1 -type d -name "-mnt-*" 2>/dev/null || true)

if [ -z "$CORRUPTED_DIRS" ]; then
    echo -e "${GREEN}✓ No corrupted directories found!${NC}"
    echo ""
    echo "Current project directories:"
    ls -la "$HOME/.claude/projects/" 2>/dev/null || echo "No projects found"
    exit 0
fi

echo -e "${RED}Found corrupted directories:${NC}"
echo "$CORRUPTED_DIRS"
echo ""

# Ask for confirmation
read -p "Do you want to remove these corrupted directories? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted. No changes made."
    exit 0
fi

# Remove corrupted directories
echo "Removing corrupted directories..."
find "$HOME/.claude/projects/" -maxdepth 1 -type d -name "-mnt-*" -exec rm -rf {} + 2>/dev/null || true

echo -e "${GREEN}✓ Cleanup complete!${NC}"
echo ""

# Show remaining directories
echo "Remaining project directories:"
ls -la "$HOME/.claude/projects/" 2>/dev/null || echo "No projects found"
echo ""

# Provide recommendations
echo "================================================"
echo "Recommendations:"
echo "================================================"
echo ""
echo "1. Work from native Linux paths for best results:"
echo "   ${GREEN}cd ~/your-project${NC} (recommended)"
echo "   ${RED}cd /mnt/c/...${NC} (may cause issues)"
echo ""
echo "2. Copy your project to a Linux path:"
echo "   cp -r /mnt/c/path/to/project ~/project-name"
echo "   cd ~/project-name"
echo ""
echo "3. Or create a symlink:"
echo "   ln -s /mnt/c/path/to/project ~/project-name"
echo "   cd ~/project-name"
echo ""
echo "For more details, see: docs/CLAUDE_CLI_TROUBLESHOOTING.md"
echo ""
