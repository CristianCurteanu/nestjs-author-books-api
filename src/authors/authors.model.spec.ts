import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { Author } from './authors.model';
import {validate} from "class-validator"
import { async } from 'rxjs/internal/scheduler/async';

describe('AuthorsService', () => {
  // let service: AuthorsService;
  let author: Author

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   providers: [AuthorsService],
    // }).compile();

    // service = module.get<AuthorsService>(AuthorsService);
  });

  it('should have first name', async () => {
    author = new Author();
    author.lastName = 'Smith';
    author.birthdate = new Date();
    const errors = await validate(author);
    expect(errors.length).not.toBe(0);
  });

  it('should have last name', async () => {
    author = new Author();
    author.firstName = 'John';
    author.birthdate = new Date();
    const errors = await validate(author);
    expect(errors.length).not.toBe(0);
  });

  it('should have birthdate', async () => {
    author = new Author();
    author.firstName = 'John';
    author.lastName = 'Smith';
    const errors = await validate(author);
    expect(errors.length).not.toBe(0);
  });

  // TODO: Define has many relations with book entity
  // it('should have many books')
});
