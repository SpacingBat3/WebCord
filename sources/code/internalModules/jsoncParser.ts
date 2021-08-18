
import { readFileSync, PathLike } from "fs";

type CommentRuleObject = {
    /** A `RegExp` matching commented text. */
    rule: RegExp;
    /**
     * If set to `"start"`, the next lines are parsed like they're inside the comment,
     * until the parser will meet the line with an `"end"` multiline comment rule.
     * 
     * If not set at all, parser will threat the rule as the single-line comment.
     * (i.e. parser will threat the next lines as a JSON contents, unless it will
     * find a string matching the one of the `CommentRuleObject[]`).
     */
    multiline?: "start" | "end";
};

/** Parameters that can be parsed by `readFileSync` function of `fs` module. */
type FsReadFileSyncParams = {
    /** Path to file, same as `path` parameter in `readFileSync` function of `fs` module. */
    path: PathLike;
    /**
     * Encoding to use for convertion of text file data from Buffer to String.
     */
    encoding?: BufferEncoding;
};

/** JSON with Comments parser module.
 * 
 * Allows for management over `*.jsonc` files, right now only by reading it.
 * 
 * @todo Creating JSONC files, JSONC templates, parsing JSONC to JSONC template.
 * (JSONC template = comments + data as JavaScript object)
 */

const JSONC = {
    /**
     * A funtion that parses the non-standard JSON file with comments to regular
     * JavaScript object. This is achieved by parsing JSONC file to standard
     * JSON format (by ommiting comments) and parsing it to JavaScript object
     * using `JSON.parse()` method.
     * 
     * **Note**: Currently parsing `*.json` files that includes comments will
     * cause a syntax error, as comments are not a part of JSON standard.
     * 
     * @param file Object containing `path` to file and optionally its `encoding`.
     * 
     * @param rules Array of `CommentRuleObject` objects that will be included to `commentRules`.
     * 
     * @returns Parsed JavaScript object.
     * 
     * @example
     * 
     * // Read standard JSON file and save its content as string:
     * 
     * const myRegularJson = readFileSync('/path/to/file.json').toString();
     * 
     * // Read 'JSON with comments' file and save its content as string:
     * 
     * const myJsonWithComments = readFileSync('/path/to/fileWithComments.json').toString();
     * 
     * // Parse both JSON files:
     * 
     * JSON.parse(myRegularJson) // returns object
     * JSON.parse(myJsonWithComments) // syntax error!
     * jsonParseWithComments({path:'/path/to/fileWithComments.json'}) // returns object
     * jsonParseWithComments({path:'/path/to/file.json'}) // returns object
     * 
     */
    parse: (file: FsReadFileSyncParams, rules?: CommentRuleObject[]): Record<string, unknown> => {

        /* Do not parse JSON files (*.json) as JsonWithComments files (*.jsonc). */
        if (typeof (file.path) === 'string' && file.path.match('/^.*.json$') !== null)
            return JSON.parse(readFileSync(file.path).toString(file.encoding));

        const dataString = readFileSync(file.path).toString(file.encoding);

        /* Determine correct newline character */
        let newline: string;
        if (dataString.includes('\r\n'))
            newline = '\r\n';
        else if (dataString.includes('\r'))
            newline = '\r';
        else
            newline = '\n';

        const data = dataString.split(newline);
        const dataJson: string[] = [];

        const commentRules: CommentRuleObject[] = [
            { rule: /\/\/.*/ },                       // C like comments: `// example`
            { rule: /\/\*.*\*\//g },                  // C++ like comments: `/* example */`
            { rule: /\/\*.*/, multiline: "start" },  // Start of multiline comments: `/* example`
            { rule: /.*\*\/$/, multiline: "end" },    // End of multiline comments: `example */`
        ];

        // Allow for additional comment rules
        if (rules) commentRules.concat(rules);

        /** Whenever next line might be in multiline comment */
        let inCommentNext = false;

        for (const line of data) {

            /** Whenever currently tested line might be in multiline comment */
            let inComment: boolean = inCommentNext;

            let newLine = line;

            for (const ruleObject of commentRules) {
                if (newLine.match(ruleObject.rule) && ruleObject.multiline === 'start') inCommentNext = true;
                if (newLine.match(ruleObject.rule) && ruleObject.multiline === 'end' && inComment === true)
                    inComment = inCommentNext = false;
                newLine = newLine.replace(ruleObject.rule, '');
            }

            if (!inComment) dataJson.push(newLine);
        }

        const jsonStringified = dataJson.join(newline);
        return JSON.parse(jsonStringified);
    }
};

export default JSONC;