import { Controller, Post, Body, Get, Param, Patch, Delete, HttpCode } from '@nestjs/common';
import { BooksService } from './books.service';
import { async } from 'rxjs/internal/scheduler/async';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get(':id')
  async getBook(@Param() params) {
    const book = await this.booksService.getBook(params.id);
    return book;
  }

  @Post()
  async addBook(@Body() body: {
    authorID: string,
    title: string,
    iban: string,
    publishedAt: string,
  }) {
    return await this.booksService.create(body);
  }

  @Patch(':id')
  async updateBook(@Param('id') id: string, @Body() body) {
    return await this.booksService.updateBook(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBook(@Param('id') id: string) {
    await this.booksService.destroy(id);
  }
}
