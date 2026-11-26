const vscode = require('vscode');

let currentWord = 'none';
let treeDataProvider;

function activate(context) {
  treeDataProvider = new ImpactProvider();
  vscode.window.registerTreeDataProvider('impactView', treeDataProvider);

  const hoverProvider = vscode.languages.registerHoverProvider(
    { pattern: '**/*.cs' },
    {
      async provideHover(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return;
        const word = document.getText(wordRange);
        if (word.length < 3) return;

        const matches = await findMatches(word, document.uri);
        if (matches.length === 0) {
          return new vscode.Hover(`**Impact:** No other matches for \`${word}\``);
        }

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**Impact: ${word}** (${matches.length})\n\n`);
        const byFile = {};
        matches.forEach(m => {
          if (!byFile[m.shortName]) byFile[m.shortName] = [];
          byFile[m.shortName].push(m);
        });
        for (const [file, locs] of Object.entries(byFile)) {
          md.appendMarkdown(`**${file}**\n`);
          locs.slice(0, 3).forEach(loc => {
            const arg = encodeURIComponent(JSON.stringify([loc.uri.toString(), loc.line - 1]));
            md.appendMarkdown(`- [Line ${loc.line}](command:code-impact.openFile?${arg})\n`);
          });
          md.appendMarkdown('\n');
        }
        md.isTrusted = true;
        return new vscode.Hover(md);
      }
    }
  );
  context.subscriptions.push(hoverProvider);

  vscode.window.onDidChangeTextEditorSelection(event => {
    const editor = event.textEditor;
    if (!editor) return;
    const wordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
    currentWord = wordRange ? editor.document.getText(wordRange) : 'none';
    treeDataProvider.refresh();
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('code-impact.openFile', async (uri, line) => {
      if (typeof uri === 'string') uri = vscode.Uri.parse(uri);
      if (uri) {
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        if (line !== undefined) {
          const pos = new vscode.Position(line, 0);
          editor.selection = new vscode.Selection(pos, pos);
          editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
        }
      }
    }),
    vscode.commands.registerCommand('code-impact.showImpact', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const wordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
      if (wordRange) {
        currentWord = editor.document.getText(wordRange);
        treeDataProvider.refresh();
        await vscode.commands.executeCommand('impactView.focus');
      }
    })
  );
}

async function findMatches(word, currentUri) {
  const config = vscode.workspace.getConfiguration('codeImpact');
  const maxResults = config.get('maxResults', 8);
  const matches = [];
  const files = await vscode.workspace.findFiles('**/*.cs', '**/node_modules/**');

  for (const file of files) {
    if (matches.length >= maxResults) break;
    try {
      const doc = await vscode.workspace.openTextDocument(file);
      if (currentUri && doc.uri.toString() === currentUri.toString()) continue;
      const lines = doc.getText().split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const idx = line.indexOf(word);
        if (idx !== -1 && !isInCommentOrString(line, idx)) {
          const relative = vscode.workspace.asRelativePath(file);
          const shortName = relative.split('/').pop() || relative;
          matches.push({
            uri: file,
            shortName,
            line: i + 1,
            preview: line.trim().substring(0, 50)
          });
          if (matches.length >= maxResults) break;
        }
      }
    } catch (e) {}
  }
  return matches;
}

function isInCommentOrString(line, index) {
  const before = line.substring(0, index);
  if (before.includes('//')) return true;
  let inString = false;
  let quoteChar = '';
  for (let i = 0; i < before.length; i++) {
    const char = before[i];
    if ((char === '"' || char === "'") && before[i - 1] !== '\\') {
      if (!inString) { inString = true; quoteChar = char; }
      else if (char === quoteChar) inString = false;
    }
  }
  return inString;
}

class ImpactProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }
  refresh() { this._onDidChangeTreeData.fire(); }
  getTreeItem(element) { return element; }

  async getChildren() {
    if (currentWord === 'none' || currentWord.length < 3) {
      const empty = new vscode.TreeItem('No selection');
      empty.description = 'Right-click a word or place cursor on a function';
      empty.iconPath = new vscode.ThemeIcon('info');
      return [empty];
    }

    const header = new vscode.TreeItem(`SELECTED: ${currentWord.toUpperCase()}`);
    header.iconPath = new vscode.ThemeIcon('target');

    const matches = await findMatches(currentWord, vscode.window.activeTextEditor?.document.uri);

    if (matches.length === 0) {
      const none = new vscode.TreeItem('No other matches found');
      none.iconPath = new vscode.ThemeIcon('info');
      return [header, none];
    }

    const countItem = new vscode.TreeItem(`${matches.length} location${matches.length === 1 ? '' : 's'}`);
    countItem.iconPath = new vscode.ThemeIcon('list-flat');

    const items = matches.map(m => {
      const item = new vscode.TreeItem(`${m.shortName} : ${m.line}`);
      item.description = m.preview;
      item.iconPath = new vscode.ThemeIcon('file-code');
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
