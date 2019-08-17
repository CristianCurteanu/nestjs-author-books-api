import {Validate, IsDate, IsString} from 'class-validator';
import { Presence } from './../validators/presence.validator';
import {Entity, ObjectID, ObjectIdColumn, Column} from 'typeorm';

@Entity()
export class Book {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  @Validate(Presence, {
    message: 'Title is missing',
  })
  @IsString()
  title: string;

  @Column()
  @Validate(Presence, {
    message: 'Author is missing',
  })
  authorID: string;

  @Column()
  @Validate(Presence, {
    message: 'IBAN is missing',
  })
  iban: string;

  @Column()
  @IsDate()
  publishedAt: Date;
}
