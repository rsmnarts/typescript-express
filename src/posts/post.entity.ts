import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class Post {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column('text')
  public title: string;

  @Column('text')
  public content: string;
}
