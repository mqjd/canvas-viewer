import * as vscode from "vscode";
import { CanvasEditorProvider } from "./CanvasEditor";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(CanvasEditorProvider.register(context));
}

export function deactivate() {}
