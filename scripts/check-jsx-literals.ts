import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { globSync } from "glob";

const ALLOWED_ATTRS = new Set([
  "className",
  "id",
  "type",
  "name",
  "value",
  "href",
  "src",
  "target",
  "rel",
  "role",
  "tabIndex",
  "style",
  "width",
  "height",
  "viewBox",
  "fill",
  "stroke",
  "strokeWidth",
  "d",
  "x",
  "y",
  "cx",
  "cy",
  "r",
  "points",
  "preserveAspectRatio",
  "focusable",
  "xmlns",
]);

const isDataAttr = (name: string) => name.startsWith("data-");

const files = globSync("client/**/*.{ts,tsx}", {
  absolute: true,
  ignore: ["**/node_modules/**", "**/*.d.ts"],
});

const errors: string[] = [];

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const report = (node: ts.Node, message: string) => {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    errors.push(`${file}:${line + 1}:${character + 1} ${message}`);
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.getText();
      if (text.trim()) {
        report(node, `JSX text literal found: "${text.trim()}"`);
      }
    }

    if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText();
      if (!ALLOWED_ATTRS.has(name) && !isDataAttr(name)) {
        if (ts.isStringLiteral(node.initializer)) {
          report(node, `JSX string literal in "${name}" attribute: "${node.initializer.text}"`);
        }
        if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
          const expression = node.initializer.expression;
          if (ts.isStringLiteral(expression)) {
            report(node, `JSX string literal in "${name}" attribute: "${expression.text}"`);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

if (errors.length) {
  console.error("Hardcoded JSX literals detected:");
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

console.log("JSX literals check passed.");
