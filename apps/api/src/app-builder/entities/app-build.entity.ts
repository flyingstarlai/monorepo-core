import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MobileAppDefinition } from './app-definition.entity';

@Entity('TC_APP_BUILD')
export class MobileAppBuild {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'id' })
  id: string;

  @Column({ type: 'nvarchar', length: 50, name: 'app_definition_id' })
  appDefinitionId: string;

  @Column({ type: 'nvarchar', length: 20, name: 'status' })
  status: 'queued' | 'building' | 'completed' | 'failed' | 'cancelled';

  @Column({ type: 'int', name: 'jenkins_queue_id', nullable: true })
  jenkinsQueueId?: number;

  @Column({ type: 'int', name: 'jenkins_build_number', nullable: true })
  jenkinsBuildNumber?: number;

  @Column({
    type: 'nvarchar',
    length: 500,
    name: 'artifact_path',
    nullable: true,
  })
  artifactPath?: string;

  @Column({
    type: 'nvarchar',
    length: 500,
    name: 'console_url',
    nullable: true,
  })
  consoleUrl?: string;

  @Column({ type: 'nvarchar', name: 'error_message', nullable: true })
  errorMessage?: string;

  @Column({ type: 'nvarchar', length: 50, name: 'started_by' })
  startedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'datetime', name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ type: 'datetime', name: 'completed_at', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => MobileAppDefinition, (definition) => definition.builds, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_definition_id' })
  appDefinition: MobileAppDefinition;
}
