
export class DataEscaper {
  static escapeValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'number') {
      // Handle NaN and Infinity
      if (isNaN(value) || !isFinite(value)) return 'NULL';
      return String(value);
    }
    if (typeof value === 'object') {
      try {
        return `'${JSON.stringify(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
      } catch (e) {
        return 'NULL';
      }
    }
    if (typeof value === 'string') {
      // Escape single quotes, backslashes, and handle special characters for MySQL
      return `'${value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "''")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")}'`;
    }
    return `'${String(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
  }
}
