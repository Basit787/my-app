// One run of text from `pdftohtml -xml` with its font, in PDF points
export type TextRun = {
  x: number;
  y: number;
  width: number;
  height: number;
  size: number;
  family: string;
  color: string;
  bold: boolean;
  italic: boolean;
};
