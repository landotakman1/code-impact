# Code Impact

Lightweight change-impact helper for VS Code.  
Select a function or word and see other files and lines that reference it.

## Features
- Side panel that updates as you move the cursor
- Hover bubble with clickable results
- Right-click “Show Impact” command
- Ignores comments and string literals
- Shows multiple matches per file
- Configurable max results
- Click any result to jump directly to that line

## Installation
1. Download the latest `.vsix` from the [Releases](https://github.com/landotakman1/code-impact/releases) or from the repo root.
2. In VS Code, open the Extensions view (`Ctrl+Shift+X`).
3. Click the `...` menu → **Install from VSIX…**
4. Select the `code-impact-0.0.1.vsix` file.
5. Reload VS Code when prompted.

## Usage
- Place your cursor on a function or word → the Impact panel updates automatically.
- Hover over a function to see a floating list.
- Right-click a word → **Show Impact**.
- Click any result to open the file and jump to the line.

## Settings
Search for “Code Impact” in VS Code settings to adjust the maximum number of results.

## Current Status
Early prototype (v0.0.1). Built for CMPA 4302. Focused on C# / Unity projects.
More features and language support coming soon.