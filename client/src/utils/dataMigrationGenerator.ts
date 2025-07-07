
import { saveAs } from "file-saver";
import { TableExtractor, type MigrationResult } from "./migration/tableExtractor";
import { MigrationBuilder } from "./migration/migrationBuilder";
import { ReportGenerator } from "./migration/reportGenerator";
import { MIGRATION_TABLES } from "./migration/tableList";

export class DataMigrationGenerator {
  async generateCompleteMigration(): Promise<void> {
    const results: MigrationResult[] = [];
    let totalRows = 0;
    let totalErrors = 0;

    console.log('Starting enhanced data migration generation...');

    for (const tableName of MIGRATION_TABLES) {
      try {
        console.log(`Processing table: ${tableName}`);
        const result = await TableExtractor.extractTableData(tableName);
        results.push(result);
        totalRows += result.rowCount;
        
        if (result.errors && result.errors.length > 0) {
          totalErrors += result.errors.length;
          console.warn(`⚠️ Errors in ${tableName}:`, result.errors);
        } else {
          console.log(`✅ Successfully processed ${result.rowCount} rows from ${tableName}`);
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Failed to process ${tableName}:`, error);
        totalErrors++;
        results.push({
          tableName,
          insertStatements: [`-- Critical Error: Failed to process ${tableName}: ${error}`],
          rowCount: 0,
          errors: [String(error)]
        });
      }
    }

    // Generate the complete migration script
    const migrationScript = MigrationBuilder.buildMigrationScript(results, totalRows, totalErrors);
    
    // Download the migration script
    const blob = new Blob([migrationScript], { type: 'text/sql;charset=utf-8' });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `mysql_data_migration_enhanced_${timestamp}.sql`);

    console.log(`✅ Enhanced migration script generated!`);
    console.log(`📊 Total rows exported: ${totalRows}`);
    console.log(`⚠️ Total errors encountered: ${totalErrors}`);
    console.log(`📁 Downloaded as: mysql_data_migration_enhanced_${timestamp}.sql`);

    return;
  }

  async generateTableReport(): Promise<string> {
    return ReportGenerator.generateTableReport();
  }
}
