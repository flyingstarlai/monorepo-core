import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentKindEntity } from './entities/document-kind.entity';
import { CreateDocumentKindDto } from './dto/create-document-kind.dto';
import { UpdateDocumentKindDto } from './dto/update-document-kind.dto';
import { DocumentKindResponseDto } from './dto/document-kind-response.dto';

@Injectable()
export class DocumentKindsService {
  constructor(
    @InjectRepository(DocumentKindEntity)
    private readonly documentKindsRepository: Repository<DocumentKindEntity>,
  ) {}

  /**
   * Get all document kinds
   */
  async findAll(): Promise<DocumentKindResponseDto[]> {
    const kinds = await this.documentKindsRepository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
    return kinds.map((kind) => this.toResponseDto(kind));
  }

  /**
   * Get active document kinds only
   */
  async findActive(): Promise<DocumentKindResponseDto[]> {
    const kinds = await this.documentKindsRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
    return kinds.map((kind) => this.toResponseDto(kind));
  }

  /**
   * Get document kind by ID
   */
  async findOne(id: number): Promise<DocumentKindResponseDto> {
    const kind = await this.documentKindsRepository.findOne({ where: { id } });
    if (!kind) {
      throw new NotFoundException(`Document kind with ID ${id} not found`);
    }
    return this.toResponseDto(kind);
  }

  /**
   * Get document kind by code
   */
  async findByCode(code: string): Promise<DocumentKindResponseDto> {
    const kind = await this.documentKindsRepository.findOne({
      where: { code },
    });
    if (!kind) {
      throw new NotFoundException(`Document kind with code ${code} not found`);
    }
    return this.toResponseDto(kind);
  }

  /**
   * Create new document kind
   */
  async create(
    createDocumentKindDto: CreateDocumentKindDto,
    userId: string,
  ): Promise<DocumentKindResponseDto> {
    const existingKind = await this.documentKindsRepository.findOne({
      where: { code: createDocumentKindDto.code },
    });

    if (existingKind) {
      throw new ForbiddenException(
        `Document kind with code ${createDocumentKindDto.code} already exists`,
      );
    }

    // Get the next display order if not provided
    let displayOrder = createDocumentKindDto.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.documentKindsRepository
        .createQueryBuilder('kind')
        .select('MAX(kind.displayOrder)', 'maxOrder')
        .getRawOne();
      displayOrder = (maxOrder?.maxOrder || 0) + 10;
    }

    const kind = this.documentKindsRepository.create({
      ...createDocumentKindDto,
      isActive: createDocumentKindDto.isActive ?? true,
      displayOrder,
      createdBy: userId,
    });

    const savedKind = await this.documentKindsRepository.save(kind);
    return this.toResponseDto(savedKind);
  }

  /**
   * Update existing document kind
   */
  async update(
    id: number,
    updateDocumentKindDto: UpdateDocumentKindDto,
    userId: string,
  ): Promise<DocumentKindResponseDto> {
    const kind = await this.findOne(id);

    // Check if code is being changed and if it conflicts with existing ones
    if (
      updateDocumentKindDto.code &&
      updateDocumentKindDto.code !== kind.code
    ) {
      const existingKind = await this.documentKindsRepository.findOne({
        where: { code: updateDocumentKindDto.code },
      });
      if (existingKind) {
        throw new ForbiddenException(
          `Document kind with code ${updateDocumentKindDto.code} already exists`,
        );
      }
    }

    const updatedKind = this.documentKindsRepository.merge(kind, {
      ...updateDocumentKindDto,
      modifiedBy: userId,
    });

    const savedKind = await this.documentKindsRepository.save(updatedKind);
    return this.toResponseDto(savedKind);
  }

  /**
   * Delete document kind
   */
  async remove(id: number): Promise<void> {
    const kind = await this.findOne(id);

    // Check if any documents are using this kind
    const { DocumentEntity } = require('../entities/documents.entity');
    const documentsRepository =
      this.documentKindsRepository.manager.getRepository(DocumentEntity);
    const documentsCount = await documentsRepository.count({
      where: { documentKindId: id },
    });

    if (documentsCount > 0) {
      throw new ForbiddenException(
        `Cannot delete document kind: it is being used by ${documentsCount} document(s)`,
      );
    }

    await this.documentKindsRepository.remove(kind);
  }

  /**
   * Toggle active status of document kind
   */
  async toggleActive(
    id: number,
    userId: string,
  ): Promise<DocumentKindResponseDto> {
    const kind = await this.findOne(id);
    kind.isActive = !kind.isActive;
    kind.modifiedBy = userId;

    const savedKind = await this.documentKindsRepository.save(kind);
    return this.toResponseDto(savedKind);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(kind: DocumentKindEntity): DocumentKindResponseDto {
    return {
      id: kind.id,
      code: kind.code,
      name: kind.name,
      description: kind.description,
      isActive: kind.isActive,
      displayOrder: kind.displayOrder,
      createdBy: kind.createdBy,
      createdAt: kind.createdAt,
      modifiedBy: kind.modifiedBy,
      updatedAt: kind.updatedAt,
    };
  }
}
