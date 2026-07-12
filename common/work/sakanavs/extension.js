
const vscode = require('vscode');
const child_process = require('child_process');
const fs = require('fs');
const net = require('net');

function helloWorld() { 
	vscode.window.showInformationMessage('Hello, world!')
	vscode.debug.activeDebugConsole.appendLine( "++++++++++++++++++++++++++++AWEOKDWOWKODKOWKODKOAWOWKAODKAWKDOKOAKDWOKAWOD");
	console.log('chello, world');
}

function activate( context) {
	console.log('Congratulations, your extension "sakanavs" is now active!');
	
	context.subscriptions.push( vscode.commands.registerCommand('sakana.helloWorld', helloWorld));
	context.subscriptions.push( vscode.debug.registerDebugAdapterDescriptorFactory( 'sakana', new SakanaDebugAdapterFactory() ));
}

function deactivate() {
}

module.exports = { activate, deactivate };

class SakanaDebugAdapterFactory {

	async createDebugAdapterDescriptor( _session, _exec) {
		console.log( "createDebugAdapterDescriptor", _session, _exec);
		let conf = _session.configuration;
		//	search sakana executable
		let exepath = this.searchexe( conf.cwd);
		let args = conf.args.split( " ");
		let options = { cwd: conf.cwd, env: process.env};
		let proc = child_process.spawn( exepath, args, options);
		console.log( "spawn", exepath, proc);
		proc.stdout.on('data', (data) => {
			console.log('STDOUT', data.toString());
		});
		proc.stderr.on('data', (data) => {
			console.log('STDERR', data.toString());
		});
		proc.on('close', (code) => {
			console.log('CODE', code);
		});
		this.proc = proc;
		//	sakana.exeがデバッグ停止ポイントにつくまで待つ
		//	portがリッスンされてるかチェックできれば良いが、出来なければstdoutで特定文字列
		let port = 9945;
		let p = new Promise( async (resolve, reject) => {
			//	500ms最初に待つ
			await new Promise( res => setTimeout( res, 500));
			//	portにバインド出来なかったら準備OK
			console.log( 'port check', port);
			let ok = false;
			for( let l = 0;!ok && l <= 20;l ++){
				let ok = await new Promise( res => {
					let serv = net.createServer( socket => {
					});
					serv.on( 'error', (err) => {
						//	OK!!!!!!!!!!!!!!!!!!!!!!!!!
						console.log( 'ok!',err);
						res( true);
					});
					serv.listen( port, () => {
						console.log( '...', l);
						//	dame
						serv.close();
						setTimeout( ()=>{ res( false); }, 200);
					});
				});
				if( ok) break;
			}
			//	okじゃなくても↓で実行させちゃう
			let ex = new vscode.DebugAdapterServer( port, "localhost");
			resolve( ex);
		});
		return p;
	}

	//	search sakana executable
	searchexe( cwd) {
		const fn = "\\sakana_d.exe";
		//	cwd/fn
		let path = cwd + fn;
		if( fs.existsSync( path)) return path;
		//	cwd/bin/fn
		path = cwd + "\\bin" + fn;
		if( fs.existsSync( path)) return path;
		//	env.SAKANAGL
		if( process.env.SAKANAGL){
			path = process.env.SAKANAGL + "\\bin" + fn;
			if( fs.existsSync( path)) return path;
		}
		return null;
	}

	dispose() {
		console.log( "SakanaDebugAdapterFactory DISPOSE", this.proc);
		if( this.proc){
			this.proc.kill( 'SIGTERM');
			this.proc = null;
		}
	}
}
