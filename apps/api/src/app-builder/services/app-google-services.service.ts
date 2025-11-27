import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppIdentifier } from '../entities/app-identifier.entity';
import { UploadGoogleServicesDto } from '../dto/upload-google-services.dto';

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

    // Save new identifiers
    const identifiers = appIds.map((appId, index) =>
      this.identifierRepository.create({
        id: `id_${Date.now()}_${index}`,
        appId: appId.appId,
        packageName: appId.packageName,
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

          // Only process entries with TCS prefix
          const tcsMatch = packageName.match(/TCS[0-9]+/);
          if (tcsMatch) {
            appId = tcsMatch[0];
            return { appId, packageName };
          }

          // Skip entries without TCS prefix
          return null;
        })
        .filter(
          (item): item is { appId: string; packageName: string } =>
            item !== null,
        );
    } catch {
      return [];
    }
  }
}
