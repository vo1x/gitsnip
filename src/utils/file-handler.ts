import * as fs from "node:fs";
import * as path from "node:path";

export const writeFileRecursive = (filePath: string, buffer: ArrayBuffer) => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from(buffer));
};
