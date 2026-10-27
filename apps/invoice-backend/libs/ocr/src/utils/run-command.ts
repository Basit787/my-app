import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// A CLI tool's stdout; a failure carries the tool's own stderr
export const runCommand = async (command: string, args: string[]): Promise<string> => {
  try {
    const { stdout } = await execFileAsync(command, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    return stdout;
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr?.trim();
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${command} failed: ${stderr || message}`);
  }
};
