import "reflect-metadata";
import { createConnection } from "typeorm";
import { DocumentsEntity } from "./src/documents/entities/documents.entity";

async function fixDocumentPaths() {
  const connection = await createConnection({
    type: "mssql",
    host: "60.248.245.253",
    port: 1433,
    username: "sa",
    password: "dsc",
    database: "TC_DEV",
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    entities: [DocumentsEntity],
  });

  const repo = connection.getRepository(DocumentsEntity);
  const docs = await repo.find();

  console.log(`Found ${docs.length} documents`);

  for (const doc of docs) {
    let needsUpdate = false;
    
    if (doc.officeFilePath && doc.officeFilePath.startsWith('documents/')) {
      doc.officeFilePath = doc.officeFilePath.replace('documents/', '');
      needsUpdate = true;
    }
    
    if (doc.pdfFilePath && doc.pdfFilePath.startsWith('documents/')) {
      doc.pdfFilePath = doc.pdfFilePath.replace('documents/', '');
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await repo.save(doc);
      console.log(`Updated paths for document ${doc.id}`);
      console.log(`  officeFilePath: ${doc.officeFilePath}`);
      console.log(`  pdfFilePath: ${doc.pdfFilePath}`);
    }
  }

  await connection.close();
  console.log("Done!");
}

fixDocumentPaths().catch(console.error);
