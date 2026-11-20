const vscode = require('vscode');

function activate(context) {
  const items = [
    { label: 'PlayerController.cs - Line 45', detail: 'HandleMovement()' },
    { label: 'EnemyAI.cs - Line 12', detail: 'OnPlayerMove()' },
    { label: 'GameManager.cs - Line 88', detail: 'CheckState()' }
  ];

  const provider = {
    getTreeItem: (element) => element,
    getChildren: () => {
      const header = new vscode.TreeItem('Selected: setCount()', vscode.TreeItemCollapsibleState.None);
      header.description = '3 scripts may be affected';
      
      const fileItems = items.map(item => {
        const treeItem = new vscode.TreeItem(item.label);
        treeItem.description = item.detail;
        treeItem.command = {
          command: 'code-impact.openFile',
          title: 'Open',
          arguments: [item.label]
        };
        return treeItem;
      });

      return [header, ...fileItems];
    }
  };

  vscode.window.registerTreeDataProvider('impactView', provider);

  context.subscriptions.push(
    vscode.commands.registerCommand('code-impact.openFile', (label) => {
      vscode.window.showInformationMessage(`Navigate to: ${label}`);
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
