import { Injectable, BadRequestException, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Author } from './authors.model';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import {validate} from 'class-validator';
import { Book } from './../books/books.model';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async getAll(): Promise<Author[]> {
    return await this.authorRepository.find();
  }

  async getBooks(id: string) {
    const author = await this.findOneAuthor(id);
    const books = await this.bookRepository.find({ authorID: author.id.toHexString() });

    return books;
  }

  async findOneAuthor(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne(id);
    if (author === null || author === undefined) {
      throw new NotFoundException(`No author with id '${id}' found`);
    }
    return author;
  }

  async create(body: {
    firstName: string,
    lastName: string,
    birthday: string,
  }): Promise<Author> {
    if (Array.isArray(body)) {
      throw new BadRequestException('Body should not be an array');
    }

    const author = plainToClass(Author, {
      firstName: body.firstName,
      lastName: body.lastName,
      birthdate: new Date(body.birthday),
    });

    await this.validateFields(author);

    return await this.authorRepository.save(author);
  }

  async changeAuthor(id: string, body): Promise<Author> {
    const author = await this.findOneAuthor(id);

    if (body.firstName !== undefined) {
      author.firstName = body.firstName;
    }

    if (body.lastName !== undefined) {
      author.lastName = body.lastName;
    }

    if (body.birthday !== undefined) {
      author.birthdate = new Date(body.birthday);
    }

    await this.validateFields(author);

    await this.authorRepository.update(id, author);
    return author;
  }

  async destroy(id: string): Promise<string> {
    await this.findOneAuthor(id);
    await this.authorRepository.delete(id);
    return id;
  }

  private async validateFields(author: Author): Promise<Author> {
    const errors = await validate(author);

    const missingFieldsErrors = errors.map(e => e.constraints.presence).filter(e => e !== undefined);

    if (missingFieldsErrors.length > 0) {
      throw new BadRequestException(missingFieldsErrors.join(', '));
    }

    if (errors.length > 0) {
      throw new UnprocessableEntityException(errors.map(e => Object.values(e.constraints).join(', ')).join('; '));
    }

    return author;
  }
}
