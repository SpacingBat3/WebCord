import { app, dialog } from "electron";
import * as colors from "colors/safe";

/* Handles uncaughtException errors */

export default function crashHandler(): void {
    process.on('uncaughtException', async (error) => {
        let stack = "", message = "", stackColor = "";
        const name = "UncaughtException: " + app.getName() + " threw '" + error.name + "'.";
        if (error.message !== "")
            message = "\n\n" + error.message;


        if (error.stack !== undefined) {
            stack = "\n" + error.stack
                .replace(error.name + ': ' + error.message, '');
            stackColor = stack;
            const stackLines = stack.split(/\r\n|\n|\r/);
            const stackProcessed: string[] = [], stackColorProcessed: string[] = [];
            for (const line of stackLines) {
                const regexAppPath = app.getAppPath().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (line.match(RegExp("at.*\\(" + regexAppPath + ".*\\).*", 'g'))) {
                    let modifiedLine = line;
                    const tsRule = line.match(/\(\/.*\.ts.*\)/);
                    if (tsRule)
                        modifiedLine = line.replace(tsRule[0].replace(new RegExp("\\((" + regexAppPath + "\\/).*\\)"), "$1"), "");
                    stackProcessed.push(modifiedLine);
                    stackColorProcessed.push(modifiedLine);
                } else {
                    stackColorProcessed.push(colors.gray(line));
                }
            }
            if (error.message !== "")
                stack = "\n\n" + stackProcessed.join('\n');
            else
                stack = stackProcessed.join('\n');
            stackColor = stackColorProcessed.join('\n');
        }

        await app.whenReady();
        console.error('\n' + colors.red(colors.bold(name)) + colors.blue(message) + stackColor);
        dialog.showMessageBoxSync({
            title: name,
            message: error.message + stack,
            type: 'error'
        });

        let errCode: number;
        switch (error.name) {
            case "Error":
                errCode = 101;
                break;
            case "TypeError":
                errCode = 102;
                break;
            default:
                errCode = 100;
        }
        console.error("\nApplication crashed (Error code: " + errCode + ")\n");
        app.exit(errCode);
    });
}