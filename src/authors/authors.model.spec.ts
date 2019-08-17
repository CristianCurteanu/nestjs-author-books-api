
import { Author } from './authors.model';
import {validate} from 'class-validator';

describe('Author', () => {
  let author: Author;

  beforeEach(async () => {
    author = new Author();
  });

  it('should have first name', async () => {
    author.lastName = 'Smith';
    author.birthdate = new Date();
    const errors = await validate(author);
    expect(errors.length).not.toBe(0);
    expect(errors[0].constraints.presence).toBe('First name missing')
  });

  it('should have last name', async () => {
    author.firstName = 'John';
    author.birthdate = new Date();
    const errors = await validate(author);
    expect(errors.length).not.toBe(0);
    expect(errors[0].constraints.presence).toBe('Last name missing')
  });

  it('should have birthdate', async () => {
    author.firstName = 'John';
    author.lastName = 'Smith';
    const errors = await validate(author);
    expect(errors.length).not.toBe(0);
    expect(errors[0].constraints.isDate).toBe('Invalid format for author\'s birthdate')
  });
});
