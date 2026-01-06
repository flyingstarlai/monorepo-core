import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppIdentifier } from '../entities/app-identifier.entity';
import { UploadGoogleServicesDto } from '../dto/upload-google-services.dto';
import { IdGenerator } from '../../utils/id-generator';
import { MinioService } from '../../minio/minio.service';

export interface GoogleServicesData {
  client: Array<{
    client_info?: {
      android_client_info?: {
        package_name?: string;
      };
    };
  }>;
}

@Injectable()
export class MobileAppGoogleServicesService {
  constructor(
    @InjectRepository(MobileAppIdentifier)
    private readonly identifierRepository: Repository<MobileAppIdentifier>,
    private readonly minioService: MinioService,
  ) {}

  async uploadGlobal(
    uploadDto: UploadGoogleServicesDto,
    createdBy: string,
  ): Promise<{ message: string; count: number }> {
    // Parse and extract identifiers
    const appIds = await this.parseAppIds(uploadDto.content);

    // Upload to Minio (single file for all APP_IDs)
    await this.minioService.uploadGoogleServices(uploadDto.content);

    // Delete existing identifiers
    await this.identifierRepository.clear();

    // Save new identifiers (without content)
    const identifiers = appIds.map((appId) =>
      this.identifierRepository.create({
        id: IdGenerator.generateIdentifierId(),
        appId: appId.appId,
        packageName: appId.packageName,
        createdBy,
      }),
    );

    await this.identifierRepository.save(identifiers);

    return {
      message: 'Successfully uploaded Google Services file',
      count: identifiers.length,
    };
  }

  async getIdentifiers(): Promise<MobileAppIdentifier[]> {
    const identifiers = await this.identifierRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Sort by appId in alphanumeric order (TCS01, TCS02, TCS03, etc.)
    return identifiers.sort((a, b) => {
      // Extract numeric part from appId (e.g., TCS01 -> 01)
      const extractNumber = (appId: string): number => {
        const match = appId.match(/TCS(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const numA = extractNumber(a.appId);
      const numB = extractNumber(b.appId);

      return numA - numB;
    });
  }

  async getGoogleServicesFile(): Promise<string | null> {
    try {
      const buffer = await this.minioService.downloadLatestGoogleServices();
      return buffer.toString('utf-8');
    } catch {
      return null;
    }
  }

  async parseAppIds(
    content: string,
  ): Promise<Array<{ appId: string; packageName: string }>> {
    try {
      const googleServices = JSON.parse(content);
      const clientInfo = googleServices.client || [];

      return clientInfo
        .map((client: GoogleServicesData['client'][number]) => {
          const packageName =
            client.client_info?.android_client_info?.package_name || '';

          // Only process packages that contain TCS[0-9]+ pattern
          const tcsMatch = packageName.match(/TCS[0-9]+/);
          if (!tcsMatch) {
            return null;
          }

          const appId = tcsMatch[0].toUpperCase();
          return { appId, packageName };
        })
        .filter(
          (item): item is { appId: string; packageName: string } =>
            item !== null && item.packageName,
        );
    } catch {
      return [];
    }
  }
}
