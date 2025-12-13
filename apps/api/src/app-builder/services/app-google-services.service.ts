import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppIdentifier } from '../entities/app-identifier.entity';
import { UploadGoogleServicesDto } from '../dto/upload-google-services.dto';
import { IdGenerator } from '../../utils/id-generator';

@Injectable()
export class MobileAppGoogleServicesService {
  constructor(
    @InjectRepository(MobileAppIdentifier)
    private readonly identifierRepository: Repository<MobileAppIdentifier>,
  ) {}

  async uploadGlobal(
    uploadDto: UploadGoogleServicesDto,
    createdBy: string,
  ): Promise<{ message: string; count: number }> {
    // Delete existing identifiers
    await this.identifierRepository.clear();

    // Parse and extract identifiers
    const appIds = await this.parseAppIds(uploadDto.content);

    // Save new identifiers with content
    const identifiers = appIds.map((appId) =>
      this.identifierRepository.create({
        id: IdGenerator.generateIdentifierId(),
        appId: appId.appId,
        packageName: appId.packageName,
        googleServicesContent: uploadDto.content,
        createdBy,
      }),
    );

    await this.identifierRepository.save(identifiers);

    return {
      message: 'Successfully extracted and saved identifiers',
      count: identifiers.length,
    };
  }

  async getIdentifiers(): Promise<MobileAppIdentifier[]> {
    return this.identifierRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getGoogleServicesFile(): Promise<string | null> {
    const identifier = await this.identifierRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    return identifier?.googleServicesContent || null;
  }

  async parseAppIds(
    content: string,
  ): Promise<Array<{ appId: string; packageName: string }>> {
    try {
      const googleServices = JSON.parse(content);
      const clientInfo = googleServices.client || [];

      return clientInfo
        .map((client: any) => {
          const packageName =
            client.client_info?.android_client_info?.package_name || '';
          let appId = packageName;

          // If package_name contains TCS[0-9]+, use that match (uppercased)
          const tcsMatch = packageName.match(/TCS[0-9]+/);
          if (tcsMatch) {
            appId = tcsMatch[0].toUpperCase();
          } else {
            // ELSE use the last segment of the package name (text after the final .)
            appId = packageName.split('.').pop() || packageName;
          }

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
