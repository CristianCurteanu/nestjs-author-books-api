import { Injectable, BadRequestException, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './books.model';
import { validate } from 'class-validator';

// TODO: Refactor BookService and Author service to use mixins
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(body: {
    title: string,
    iban: string,
    authorID: string,
    publishedAt: string,
  }): Promise<Book> {
    if (Array.isArray(body)) {
      throw new BadRequestException('Body should not be an array');
    }

    const book = plainToClass(Book, {
      title: body.title,
      iban: body.iban,
      publishedAt: new Date(body.publishedAt),
      authorID: body.authorID,
    });

    await this.validateFields(book);

    return await this.bookRepository.save(book);
  }

  async getBook(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne(id);
    if (book === null || book === undefined) {
      throw new NotFoundException(`No book with id '${id}' found`);
    }
    return book;
  }

  async updateBook(id: string, body: {
    title: string,
    iban: string,
    authorID: string,
    publishedAt: string,
  }): Promise<Book> {
    if (Array.isArray(body)) {
      throw new BadRequestException('Body should not be an array');
    }

    const book = await this.getBook(id);

    if (body.title) {
      book.title = body.title;
    }

    if (body.iban) {
      book.title = body.title;
    }

    if (body.publishedAt) {
      book.title = body.title;
    }

    if (body.authorID) {
      book.authorID = body.authorID;
    }

    await this.validateFields(book);
    await this.bookRepository.update(id, book);

    return book;
  }

  async destroy(id: string) {
    await this.getBook(id);
    await this.bookRepository.delete(id);
    return id;
  }

  private async validateFields(book: Book): Promise<Book> {
    const errors = await validate(book);

    const missingFieldsErrors = errors.map(e => e.constraints.presence).filter(e => e !== undefined);

    if (missingFieldsErrors.length > 0) {
      throw new BadRequestException(missingFieldsErrors.join(', '));
    }

    if (errors.length > 0) {
      throw new UnprocessableEntityException(errors.map(e => Object.values(e.constraints).join(', ')).join('; '));
    }

    return book;
  }
}
