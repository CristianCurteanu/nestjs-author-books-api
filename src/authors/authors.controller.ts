import { Controller, Post, Body, Get, Param, Patch, Delete, HttpCode } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { BooksService } from 'src/books/books.service';

@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
  ) {}

  @Get()
  async getAuthors() {
    return await this.authorsService.getAll();
  }

  @Get(':id')
  async findAuthor(@Param('id') id: string) {
    return await this.authorsService.findOneAuthor(id);
  }

  @Get('/:id/books')
  async getAuthorsBooks(@Param() params) {
    const books = await this.authorsService.getBooks(params.id);

    return books;
  }

  @Post()
  async addAuthor(@Body() body) {
    return await this.authorsService.create(body);
  }

  @Patch(':id')
  async changeAuthor(@Param('id') id: string, @Body() body) {
    return await this.authorsService.changeAuthor(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async destroyAuthor(@Param('id') id: string) {
    await this.authorsService.destroy(id);
  }
}
