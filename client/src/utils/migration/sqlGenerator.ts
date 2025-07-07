
import { DataEscaper } from './dataEscaping';

export class SQLGenerator {
  static generateInsertStatement(tableName: string, data: any[]): string[] {
    if (!data || data.length === 0) return [`-- No data found for table: ${tableName}`];

    const statements: string[] = [];
    const columns = Object.keys(data[0]);
    
    statements.push(`-- Data migration for table: ${tableName}`);
    statements.push(`-- Total rows: ${data.length}`);
    statements.push('');
    
    // Generate INSERT statements in smaller batches for better MySQL compatibility
    const batchSize = 50; // Smaller batches for MySQL
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        const values = batch.map(row => {
          const rowValues = columns.map(col => DataEscaper.escapeValue(row[col]));
          return `(${rowValues.join(', ')})`;
        }).join(',\n  ');
        
        statements.push(
          `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n  ${values};`
        );
        statements.push(''); // Empty line for readability
      } catch (error) {
        statements.push(`-- Error generating INSERT for batch ${Math.floor(i/batchSize) + 1}: ${error}`);
      }
    }
    
    return statements;
  }
}
