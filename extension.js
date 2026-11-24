const vscode = require('vscode');

let currentWord = 'none';
let treeDataProvider;

function activate(context) {
  treeDataProvider = new ImpactProvider();
  vscode.window.registerTreeDataProvider('impactView', treeDataProvider);

  vscode.window.onDidChangeTextEditorSelection(event => {
    const editor = event.textEditor;
    if (!editor) return;

    const position = editor.selection.active;
    const wordRange = editor.document.getWordRangeAtPosition(position);
    currentWord = wordRange ? editor.document.getText(wordRange) : 'none';
    treeDataProvider.refresh();
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('code-impact.openFile', async (uri, line) => {
      if (uri) {
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        if (line !== undefined) {
          const pos = new vscode.Position(line, 0);
          editor.selection = new vscode.Selection(pos, pos);
          editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
        }
      }
    })
  );
}

class ImpactProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren() {
    if (currentWord === 'none' || currentWord.length < 3) {
      const empty = new vscode.TreeItem('No selection');
      empty.description = 'Click a function or word';
      empty.iconPath = new vscode.ThemeIcon('info');
      return [empty];
    }

    // Header — distinct icon and no command
    const header = new vscode.TreeItem(`SELECTED: ${currentWord.toUpperCase()}`);
    header.iconPath = new vscode.ThemeIcon('target');
    header.description = '';
    header.tooltip = `Currently selected: ${currentWord}`;

    const files = await vscode.workspace.findFiles('**/*.cs', '**/node_modules/**');
    const matches = [];

    for (const file of files.slice(0, 40)) {
      try {
        const doc = await vscode.workspace.openTextDocument(file);
        if (doc.fileName === vscode.window.activeTextEditor?.document.fileName) continue;

        const lines = doc.getText().split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(currentWord)) {
            const relative = vscode.workspace.asRelativePath(file);
            const shortName = relative.split('/').pop() || relative;
            matches.push({
              uri: file,
              shortName,
              line: i + 1,
              preview: lines[i].trim().substring(0, 45)
            });
            break;
          }
        }
        if (matches.length >= 8) break;
      } catch (e) {}
    }

    const countItem = new vscode.TreeItem(
      matches.length ? `${matches.length} location${matches.length === 1 ? '' : 's'}` : 'No other matches'
    );
    countItem.iconPath = new vscode.ThemeIcon('list-flat');
    countItem.description = '';

    const items = matches.map(m => {
      const item = new vscode.TreeItem(`${m.shortName} : ${m.line}`);
      item.description = m.preview;
      item.iconPath = new vscode.ThemeIcon('file-code');
      item.tooltip = `${m.shortName} (line ${m.line})\n${m.preview}`;
      item.command = {
        command: 'code-impact.openFile',
        title: 'Open',
        arguments: [m.uri, m.line - 1]
      };
      return item;
    });

    return [header, countItem, ...items];
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
