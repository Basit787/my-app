import { runCommand } from "backend-common";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const extractText = async (buffer: Buffer, extension: string): Promise<string> => {
  if (extension !== ".pdf") return buffer.toString("utf8");
  const folder = await mkdtemp(path.join(tmpdir(), "rag-"));
  const pdfPath = path.join(folder, "document.pdf");
  try {
    await writeFile(pdfPath, buffer);
    return await runCommand("pdftotext", [pdfPath, "-"]);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
};
