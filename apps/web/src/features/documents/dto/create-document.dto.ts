export interface CreateDocumentDto {
  dockind: 'PROCEDURE' | 'FORM' | 'POLICY' | 'MANUAL' | 'OTHER';
  docno: string;
  docna: string;
  docver: string;
  docfile?: string;
  docfilepdf?: string;
}
