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

  @Column({ type: 'datetime', name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ type: 'datetime', name: 'completed_at', nullable: true })
  completedAt?: Date;

  // New fields for enhanced build history
  @Column({ type: 'text', name: 'build_parameters', nullable: true })
  buildParameters?: string;

  @Column({
    type: 'nvarchar',
    length: 1000,
    name: 'error_details',
    nullable: true,
  })
  errorDetails?: string;

  @Column({
    type: 'nvarchar',
    length: 100,
    name: 'error_category',
    nullable: true,
  })
  errorCategory?: string;

  @Column({ type: 'int', name: 'duration_ms', nullable: true })
  durationMs?: number;

  @Column({ type: 'int', name: 'memory_usage_mb', nullable: true })
  memoryUsageMb?: number;

  @Column({ type: 'int', name: 'cpu_usage_percent', nullable: true })
  cpuUsagePercent?: number;

  @Column({ type: 'nvarchar', length: 50, name: 'build_stage', nullable: true })
  buildStage?: string;

  @Column({ type: 'int', name: 'stage_progress_percent', nullable: true })
  stageProgressPercent?: number;

  @Column({ type: 'text', name: 'performance_metrics', nullable: true })
  performanceMetrics?: string;

  @Column({
    type: 'nvarchar',
    length: 100,
    name: 'environment',
    nullable: true,
  })
  environment?: string;

  @Column({
    type: 'nvarchar',
    length: 100,
    name: 'branch_name',
    nullable: true,
  })
  branchName?: string;

  @Column({
    type: 'nvarchar',
    length: 100,
    name: 'commit_hash',
    nullable: true,
  })
  commitHash?: string;

  @Column({ type: 'nvarchar', length: 20, name: 'build_type', nullable: true })
  buildType?: 'release' | 'debug' | 'profile';

  @Column({ type: 'bit', name: 'is_automated', default: false })
  isAutomated: boolean = false;

  @Column({
    type: 'nvarchar',
    length: 500,
    name: 'trigger_source',
    nullable: true,
  })
  triggerSource?: string;

  @Column({ type: 'text', name: 'build_logs_summary', nullable: true })
  buildLogsSummary?: string;

  @Column({
    type: 'nvarchar',
    length: 'max',
    name: 'test_results',
    nullable: true,
  })
  testResults?: any;

  @Column({
    type: 'nvarchar',
    length: 'max',
    name: 'quality_metrics',
    nullable: true,
  })
  qualityMetrics?: any;

  @Column({
    type: 'nvarchar',
    length: 'max',
    name: 'stages_snapshot',
    nullable: true,
  })
  stagesSnapshot?: any;

  @Column({
    type: 'datetime',
    name: 'stage_snapshot_fetched_at',
    nullable: true,
  })
  stageSnapshotFetchedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => MobileAppDefinition, (definition) => definition.builds, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'app_definition_id' })
  appDefinition: MobileAppDefinition;
}
