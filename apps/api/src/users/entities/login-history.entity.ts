import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ACCOUNT_LOGIN')
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'nvarchar', length: 50, nullable: true })
  userId: string;

  @Column({ name: 'login_at', type: 'datetime' })
  loginAt: Date;
}
