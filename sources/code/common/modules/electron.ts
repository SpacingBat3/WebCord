/* electron.ts – electron-specific functions made to work independently of its process. */
import { app } from "electron/main";
import { existsSync } from "fs";
import { resolve } from "path";

function catchAndThrowErrors (error:unknown) {
	if(error instanceof Error)
		throw error;
}

/** The current application directory. Cross-process safe method. */
export function getAppPath(): string {
	if (process.type === 'browser')
		return app.getAppPath();
	else {
		// Calculate the project's directory based on the `package.json` position.
		let path = __dirname;
		while(!existsSync(resolve(path, "./package.json")) && path !== "/") {
			path = resolve(path, '../');
		}
		return path;
	}
}

/** Show a message box. Cross-process safe method. */
export function showMessageBox(options: Electron.MessageBoxOptions): void {
	if (process.type === 'browser') {
		import('electron').then(api => {
			api.dialog.showMessageBox(options)
				.catch(catchAndThrowErrors);
		}).catch(catchAndThrowErrors);
	} else {
		const title = options.title ? options.title + '\n' : '';
		alert(title + options.message);
	}
}

/** The current application locale. Cross-process safe method. */
export function getLocale(): string {
	if (process.type === 'browser')
		return app.getLocale();
	else
		return navigator.language;
}

/**
 * The current application name (fallbacks to `the application` on renderer
 * process). Cross-process safe method.
 * */
export function getName(): string {
	if (process.type === 'browser')
		return app.getName();
	else
		return 'the application';
}