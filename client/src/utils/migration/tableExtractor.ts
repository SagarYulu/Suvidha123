
import { SQLGenerator } from './sqlGenerator';

export interface MigrationResult {
  tableName: string;
  insertStatements: string[];
  rowCount: number;
  errors?: string[];
}

export class TableExtractor {
  static async extractTableData(tableName: string): Promise<MigrationResult> {
    console.log(`Extracting data from table: ${tableName}`);
    
    try {
      // Use a more robust query approach
      const { data, error, count } = await (supabase as any)
        .from(tableName)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error(`Error extracting ${tableName}:`, error);
        return {
          tableName,
          insertStatements: [`-- Error extracting data from ${tableName}: ${error.message}`],
          rowCount: 0,
          errors: [error.message]
        };
      }
      
      console.log(`✅ Successfully extracted ${data?.length || 0} rows from ${tableName}`);
      
      const insertStatements = SQLGenerator.generateInsertStatement(tableName, data || []);
      
      return {
        tableName,
        insertStatements,
        rowCount: data?.length || 0
      };
    } catch (error) {
      console.error(`Failed to extract ${tableName}:`, error);
      return {
        tableName,
        insertStatements: [`-- Error: Failed to extract data from ${tableName}: ${error}`],
        rowCount: 0,
        errors: [String(error)]
      };
    }
  }
}
