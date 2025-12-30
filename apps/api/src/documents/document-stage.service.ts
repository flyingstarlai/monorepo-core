import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentStageEntity } from './entities/document-stage.entity';
import { DocumentsEntity } from './entities/documents.entity';
import { CreateDocumentStageDto } from './dto/create-document-stage.dto';
import { UpdateDocumentStageDto } from './dto/update-document-stage.dto';
import { IdGenerator } from '../utils/id-generator';

@Injectable()
export class DocumentStageService {
  private readonly logger = new Logger(DocumentStageService.name);

  constructor(
    @InjectRepository(DocumentStageEntity)
    private readonly documentStageRepository: Repository<DocumentStageEntity>,
  ) {}

  async findAll(): Promise<DocumentStageEntity[]> {
    const stages = await this.documentStageRepository.find({
      order: { sortOrder: 'ASC' },
    });

    const stagesWithCount = await Promise.all(
      stages.map(async (stage) => {
        const documentCount = await this.countDocuments(stage.id);
        return { ...stage, documentCount };
      }),
    );

    return stagesWithCount as DocumentStageEntity[];
  }

  async create(dto: CreateDocumentStageDto): Promise<DocumentStageEntity> {
    const stage = this.documentStageRepository.create({
      id: IdGenerator.generateDocumentStageId(),
      ...dto,
    });
    return this.documentStageRepository.save(stage);
  }

  async update(
    id: string,
    dto: UpdateDocumentStageDto,
  ): Promise<DocumentStageEntity> {
    const stage = await this.documentStageRepository.findOne({ where: { id } });

    if (!stage) {
      throw new NotFoundException(`Document stage with id ${id} not found`);
    }

    this.documentStageRepository.merge(stage, dto);
    return this.documentStageRepository.save(stage);
  }

  async remove(id: string): Promise<void> {
    const documentCount = await this.countDocuments(id);

    if (documentCount > 0) {
      throw new BadRequestException(
        `Cannot delete stage because it has ${documentCount} assigned documents. Please reassign documents to another stage first.`,
      );
    }

    const result = await this.documentStageRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Document stage with id ${id} not found`);
    }
  }

  async countDocuments(stageId: string): Promise<number> {
    const documentsRepository =
      this.documentStageRepository.manager.getRepository(DocumentsEntity);
    return documentsRepository.count({ where: { stageId } });
  }
}
