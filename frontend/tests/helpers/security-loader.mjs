import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { resolve, relative, dirname, sep } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export function sourceLoader() {
  const src = resolve("src");
  const coverageDir = process.env.NODE_V8_COVERAGE;
  const runtime = mkdtempSync(coverageDir
    ? resolve(coverageDir, "karely-runtime-")
    : resolve(".security-runtime-"));
  if (!coverageDir) {
    process.on("exit", () => rmSync(runtime, { recursive: true, force: true }));
  }

  function compile(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const path = resolve(folder, entry.name);
      if (entry.isDirectory()) {
        compile(path);
        continue;
      }
      if (!path.endsWith(".ts") || path.endsWith(".spec.ts")) continue;
      const source = readFileSync(path, "utf8")
        .replace(/templateUrl:\s*(['"])(.*?)\1/g, (_, quote, file) =>
          "template:" + JSON.stringify(readFileSync(resolve(dirname(path), file), "utf8")))
        .replace(/styleUrl:\s*(['"])(.*?)\1/g, "styles:[]");
      const { outputText } = ts.transpileModule(source, {
        fileName: path,
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ES2022,
          experimentalDecorators: true,
          inlineSourceMap: true,
          inlineSources: true,
          sourceRoot: pathToFileURL(dirname(path) + sep).href,
        },
      });
      const code = outputText
        .replace(/from (['"])([.][^'"]+)\1/g, (_, quote, file) => "from '" + file + ".mjs'")
        .replace(/import\((['"])([.][^'"]+)\1\)/g, (_, quote, file) => "import('" + file + ".mjs')");
      const output = resolve(runtime, relative(src, path).replace(/\.ts$/, ".mjs"));
      mkdirSync(dirname(output), { recursive: true });
      writeFileSync(output, code);
    }
  }

  compile(src);
  return (name) => import(pathToFileURL(resolve(runtime, "app", name + ".mjs")));
}
