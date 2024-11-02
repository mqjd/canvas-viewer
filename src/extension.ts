// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path from "path";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "canvas-viewer" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "canvas-viewer.preview",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const fileName = path.basename(editor.document.fileName);

      // 创建并显示新的 webview
      const panel = vscode.window.createWebviewPanel(
        fileName,
        fileName,
        vscode.ViewColumn.One,
        {}
      );

      const content = editor.document.getText();
      panel.webview.html = `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<title>SVG Preview</title>
				</head>
				<body>
					<div>${content}</div>
				</body>
			</html>`;
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
