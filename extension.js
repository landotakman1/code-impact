const vscode = require('vscode');

function activate(context) {
  const items = [
    { label: 'PlayerController.cs — Line 45', file: 'PlayerController.cs' },
    { label: 'EnemyAI.cs — Line 12', file: 'EnemyAI.cs' },
    { label: 'GameManager.cs — Line 88', file: 'GameManager.cs' }
  ];

  const provider = {
    getTreeItem: (element) => element,
    getChildren: () => {
      return items.map(item => {
        const treeItem = new vscode.TreeItem(item.label);
        treeItem.command = {
          command: 'code-impact.openFile',
          title: 'Open File',
          arguments: [item.file]
        };
        return treeItem;
      });
    }
  };

  vscode.window.registerTreeDataProvider('impactView', provider);

  context.subscriptions.push(
    vscode.commands.registerCommand('code-impact.openFile', (file) => {
      vscode.window.showInformationMessage(`Would open: ${file}`);
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
