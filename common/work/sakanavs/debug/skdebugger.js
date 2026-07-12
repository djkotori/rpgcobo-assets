
const vscode = require('vscode');

function helloWorld() { 
	vscode.window.showInformationMessage('Hello, world!')
	console.log('chello, world');
}

function activate( context) {
	console.log('Congratulations, your extension "sakanavs" is now active!');
	
	context.subscriptions.push( vscode.commands.registerCommand('sakana.helloWorld', helloWorld));
}

function deactivate() {
}

module.exports = { activate, deactivate };
