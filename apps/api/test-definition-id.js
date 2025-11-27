// Test the ID generation fix
import { AppDataSource } from './src/data-source';
import { MobileAppDefinition } from './src/app-builder/entities';

async function testDefinitionCreation() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();

    const repository = AppDataSource.getRepository(MobileAppDefinition);

    // Test creating a definition
    const testDefinition = repository.create({
      id: `def_${Date.now()}`,
      appName: 'Test App',
      appId: 'com.test.app',
      appModule: '999',
      serverIp: '192.168.1.1',
      createdBy: 'test_user',
    });

    console.log('Created definition:', testDefinition);
    console.log('ID is not null:', testDefinition.id !== null);
    console.log('ID format correct:', testDefinition.id.startsWith('def_'));

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testDefinitionCreation();
