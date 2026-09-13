export const parseMultiLineTasks = (input: string): string[] => {
  return input
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove common list prefixes (e.g. -, *, •, →, 1., 1), etc)
      return line.replace(/^[-*•→]+\s+/, "")
                 .replace(/^\d+[.)]\s+/, "")
                 .trim();
    })
    .filter(line => line.length > 0);
};
