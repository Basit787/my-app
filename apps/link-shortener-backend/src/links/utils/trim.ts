import type { TransformFnParams } from "class-transformer";

// @Transform(trim): strings arrive without surrounding whitespace
export const trim = ({ value }: TransformFnParams): unknown => (typeof value === "string" ? value.trim() : value);
