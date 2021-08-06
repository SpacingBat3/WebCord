import { app, dialog } from "electron";
import * as colors from "colors/safe";

/* Handles uncaughtException errors */

export default function crashHandler():void {
    process.on('uncaughtException', async (error) => {
        let stack = "", message = "", stackColor = "";
        const name = "UncaughtException: " + app.getName() + " threw '" + error.name + "'.";
        if (error.message !== "")
            message = "\n\n" + error.message + "\n\n";


        if (error.stack !== undefined) {
            stack = "\n" + error.stack
                .replace(RegExp(error.name + ': ' + error.message), '');
            stackColor = stack;
            const stackLines = stack.split(/\r\n|\n|\r/);
            const stackProcessed: string[] = [], stackColorProcessed: string[] = [];
            for (const line of stackLines)
                if (line.match(RegExp("at.*\\(" + app.getAppPath() + ".*\\).*", 'g'))) {
                    stackProcessed.push(line);
                    stackColorProcessed.push(colors.bgRed(colors.white(line)));
                } else {
                    stackColorProcessed.push(line);
                }
            stack = stackProcessed.join('\n');
            stackColor = stackColorProcessed.join('\n');
        }

        await app.whenReady();
        console.error('\n' + name + message + stackColor);
        dialog.showMessageBoxSync({
            title: name,
            message: message + stack,
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