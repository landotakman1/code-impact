# code-impact

Lightweight change-impact helper for VS Code.
When a function is selected, the extension shows a short list of other scripts and line numbers that would be affected by a change.

## Current Prototype Status
This is an early prototype for CMPA 4302 Project 01.
The Impact panel currently displays hard-coded example data. Real parsing of the open file will be added in later iterations.

## How to Test
1. Make sure you have Git installed (or just download the ZIP from the green Code button on GitHub).
2. Clone or download the repository:
   git clone https://github.com/landotakman1/code-impact.git
3. Open the code-impact folder in VS Code (You can use File -> Open Folder or __if you are a real animal__, run it from the terminal with: code .).
4. Press F5 to launch the Extension Development Host.
5. In the new window, click the Impact icon in the Activity Bar (left side).
6. The panel will show a sample list of affected scripts. Clicking an item displays a navigation message.

## Features (Prototype)
- Sidebar view accessible from the Activity Bar
- Displays selected function and affected scripts/line numbers
- Basic click handling

## Requirements
- VS Code 1.80 or later
- Node.js (only needed if you want to modify the extension)

## Known Issues
- Data is currently hard-coded
- Clicking a file shows a message instead of opening the actual file