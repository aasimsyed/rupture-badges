import fs from 'fs';
import path from 'path';

interface BadgeMetadata {
  sizeInMm: string;
  catalogNumber: string;
  title: string;
  bandName?: string;
}

const metadataCache: Map<string, BadgeMetadata> = new Map();

// Helper function to parse CSV line with quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  result.push(current.trim());
  return result;
}

export function getMetadataForImage(publicId: string): BadgeMetadata | undefined {
  console.log('==========================================');
  console.log('Starting metadata lookup for:', publicId);
  
  // Extract catalog number from filename by splitting on underscore and taking first part
  const catalogNumber = publicId.split('_')[0];
  console.log('Extracted catalog number:', catalogNumber);
  
  if (!catalogNumber?.startsWith('B')) {
    console.log('Invalid catalog number format:', catalogNumber);
    return undefined;
  }
  
  // Return from cache if available
  if (metadataCache.has(catalogNumber)) {
    console.log('Returning cached metadata for:', catalogNumber);
    return metadataCache.get(catalogNumber);
  }
  
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'Rupture_Badges _Metadata.csv');
    console.log('CSV Path:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found at path:', csvPath);
      return undefined;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log('CSV loaded, first row:', csvContent.split('\n')[0]);
    const rows = csvContent.split('\n').slice(1); // Skip header
    console.log(`Processing ${rows.length} rows from CSV`);
    
    for (const row of rows) {
      const [sizeInMm, catNum, title, bandName] = parseCSVLine(row);
      console.log(`Row data: size=${sizeInMm}, catNum=${catNum}, title=${title}, band=${bandName}`);
      
      if (catNum.trim() === catalogNumber) {
        console.log('Found matching catalog number!');
        console.log('Raw band name:', bandName);
        
        let processedBandName = bandName;
        if (bandName) {
          const cleanBandName = bandName.trim();
          if (cleanBandName.includes(',')) {
            const [lastName, firstName] = cleanBandName.split(',').map(s => s.trim());
            processedBandName = `${firstName} ${lastName}`;
            console.log('Reformatted band name:', processedBandName);
          }
        }

        const metadata: BadgeMetadata = {
          sizeInMm,
          catalogNumber: catNum,
          title,
          ...(processedBandName && { bandName: processedBandName }),
        };
        console.log('Created metadata object:', metadata);
        metadataCache.set(catalogNumber, metadata);
        return metadata;
      }
    }
    console.log('No matching metadata found for catalog number:', catalogNumber);
  } catch (error) {
    console.error('Error processing metadata:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });
  }
  
  console.log('==========================================');
  return undefined;
} 