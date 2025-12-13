import { DataSource, DeepPartial } from 'typeorm';
import { UserGroupMembership } from '../groups/entities/user-group-membership.entity';
import { IdGenerator } from '../utils/id-generator';

// Define user-group membership relationships
// This will be processed after users and groups are seeded

export const seedMemberships = async (
  dataSource: DataSource,
  userIdMap: { [username: string]: string },
  groupIdMap: { [groupName: string]: string },
) => {
  try {
    const membershipRepository = dataSource.getRepository(UserGroupMembership);

    // Map usernames and group names to their generated IDs
    const processedMemberships = [
      {
        id: IdGenerator.generateMembershipId(),
        userId: userIdMap['admin'],
        groupId: groupIdMap['System Administration'],
      },
      {
        id: IdGenerator.generateMembershipId(),
        userId: userIdMap['manager'],
        groupId: groupIdMap['Management'],
      },
      {
        id: IdGenerator.generateMembershipId(),
        userId: userIdMap['manager'],
        groupId: groupIdMap['System Administration'],
      },
      {
        id: IdGenerator.generateMembershipId(),
        userId: userIdMap['user'],
        groupId: groupIdMap['General Operations'],
      },
    ];

    // Create memberships
    for (const membershipData of processedMemberships) {
      // Check if membership already exists
      const existingMembership = await membershipRepository.findOne({
        where: {
          userId: membershipData.userId,
          groupId: membershipData.groupId,
        },
      });

      if (!existingMembership) {
        const newMembership = membershipRepository.create(
          membershipData as DeepPartial<UserGroupMembership>,
        );
        await membershipRepository.save(newMembership);
        console.log(
          `✅ Membership created: User ${membershipData.userId} → Group ${membershipData.groupId}`,
        );
      } else {
        console.log(
          `ℹ️  Membership already exists: User ${membershipData.userId} → Group ${membershipData.groupId}`,
        );
      }
    }

    console.log(
      `✅ User-group memberships seeding completed. Processed ${processedMemberships.length} memberships.`,
    );
  } catch (error) {
    console.error('❌ Error seeding memberships:', error);
    throw error;
  }
};
