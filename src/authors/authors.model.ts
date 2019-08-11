import {Validate, IsDate, IsString} from 'class-validator';
import { Presence } from './../validators/presence.validator';
import {Entity, ObjectID, ObjectIdColumn, Column} from 'typeorm';

@Entity()
export class Author {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  @Validate(Presence, {
    message: 'First name missing',
  })
  @IsString({
    message: 'First name must be a string',
  })
  firstName: string;

  @Column()
  @Validate(Presence, {
    message: 'Last name missing',
  })
  @IsString({
    message: 'Last name must be a string',
  })
  lastName: string;

  @Column()
  @IsDate({
    message: 'Invalid format for author\'s birthdate',
  })
  birthdate: Date;
}
