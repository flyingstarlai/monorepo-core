import { DataSource, DeepPartial } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { IdGenerator } from '../utils/id-generator';

const groups = [
  {
    name: 'System Administration',
    description: 'System administrators and IT support team',
    isActive: true,
  },
  {
    name: 'Management',
    description: 'Management team and department heads',
    isActive: true,
  },
  {
    name: 'General Operations',
    description: 'General operations and support staff',
    isActive: true,
  },
  {
    name: 'Development Team',
    description: 'Software development and engineering team',
    isActive: true,
  },
  {
    name: 'Quality Assurance',
    description: 'QA and testing team',
    isActive: true,
  },
];

export const seedGroups = async (dataSource: DataSource) => {
  try {
    const groupRepository = dataSource.getRepository(Group);

    const processedGroups = groups.map((group) => ({
      ...group,
      id: IdGenerator.generateGroupId(), // Use nanoid ID generation
    }));

    // Check if groups already exist
    for (const groupData of processedGroups) {
      const existingGroup = await groupRepository.findOne({
        where: { name: groupData.name },
      });

      if (!existingGroup) {
        const newGroup = groupRepository.create(
          groupData as DeepPartial<Group>,
        );
        await groupRepository.save(newGroup);
        console.log(`✅ Group created: ${groupData.name}`);
      } else {
        console.log(`ℹ️  Group already exists: ${groupData.name}`);
      }
    }

    // Return group ID mapping for membership seeding
    const groupIdMap = processedGroups.reduce(
      (acc, group) => {
        acc[group.name] = group.id;
        return acc;
      },
      {} as { [groupName: string]: string },
    );

    console.log(
      `✅ Groups seeding completed. Processed ${groups.length} groups.`,
    );
    return groupIdMap;
  } catch (error) {
    console.error('❌ Error seeding groups:', error);
    throw error;
  }
};
