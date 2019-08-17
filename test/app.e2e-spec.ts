import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Author } from './../src/authors/authors.model';

import { getMongoRepository, MongoRepository } from 'typeorm';

import { plainToClass } from 'class-transformer';
import { Book } from './../src/books/books.model';

describe('AuthorsController (e2e)', () => {
  let app;
  let authorRepo: MongoRepository<Author>;
  let bookRepo: MongoRepository<Book>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    authorRepo = getMongoRepository(Author);
    bookRepo = getMongoRepository(Book);

    await app.init();
  });

  afterEach(async (done) => {
    await authorRepo.queryRunner.clearDatabase();
    await authorRepo.queryRunner.connection.close();
    return done();
  });

  afterAll(async () => {
    await authorRepo.queryRunner.clearDatabase();
    await authorRepo.queryRunner.connection.close();
  });

  it('/ (GET)', async () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('{"message":"OK"}');
  });

  it('GET /authors', async (done) => {
    const author = plainToClass(Author, {
      firstName: 'John',
      lastName: 'Smith',
      birthdate: '1991-01-08',
    });

    await authorRepo.save(author);

    return request(app.getHttpServer())
             .get('/authors')
             .expect(200)
             .expect((resp) => {
               const received = resp.body[0];
               if (received.firstName !== author.firstName) {
                 throw new Error(`First name missmatch: expected '${author.firstName}', but received ${received.firstName}`);
               }

               if (received.lastName !== author.lastName) {
                 throw new Error(`First name missmatch: expected '${author.lastName}', but received ${received.lastName}`);
               }
               return done();
             });
  });

  describe('POST /authors', () => {
    it('should create an author', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'Joe',
          lastName: 'Doe',
          birthday: '1991-01-08',
        })
        .set('Accept', 'application/json')
        .expect(201)
        .expect((resp) => {
          if (resp.body.firstName !== 'Joe') {
            throw new Error(`First name missmatch: expected 'Joe', but received ${resp.body.firstName}`);
          }

          if (resp.body.lastName !== 'Doe') {
            throw new Error(`First name missmatch: expected 'Doe', but received ${resp.body.lastName}`);
          }
          return done();
        });
    });

    it('should return 400 if sending an array', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send([
          {
            firstName: 'Joe',
            lastName: 'Doe',
            birthday: '1991-01-08',
          },
        ])
        .set('Accept', 'application/json')
        .expect(400)
        .expect((resp) => {
          if (resp.body.message !== 'Body should not be an array') {
            throw new Error(`Body is not an array`);
          }
          return done();
        });
    });

    it('should return 400 if lastName is missing', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'Joe',
          birthday: '1991-01-08',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((resp) => {
          if (resp.body.message !== 'Last name missing') {
            throw new Error(`Last name is not missing`);
          }
          return done();
        });
    });

    it('should return 400 if firstName is missing', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          lastName: 'Doe',
          birthday: '1991-01-08',
        })
        .set('Accept', 'application/json')
        .expect(400)
        .expect((resp) => {
          if (resp.body.message !== 'First name missing') {
            throw new Error(`First name is not missing`);
          }
          return done();
        });
    });

    it('should return 422 if birthday is wrong format', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 'Joe',
          lastName: 'Doe',
          birthday: '2323-1213-12',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .expect((resp) => {
          if (resp.body.message !== 'Invalid format for author\'s birthdate') {
            throw new Error(`Birthdate is not wrong`);
          }
          return done();
        });
    });

    it('should return 422 if firstName is not string', async (done) => {
      return request(app.getHttpServer())
        .post('/authors')
        .send({
          firstName: 23231,
          lastName: 'Doe',
          birthday: '1991-01-01',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .expect((resp) => {
          if (resp.body.message !== 'First name must be a string') {
            throw new Error(`First name is a string`);
          }
          return done();
        });
    });
  });

  describe('GET /authors/:id', () => {
    it('should return an author', async (done) => {
      const author = plainToClass(Author, {
        firstName: 'John',
        lastName: 'Smith',
        birthday: '1991-01-08',
      });

      await authorRepo.save(author);

      return request(app.getHttpServer())
              .get(`/authors/${author.id}`)
              .expect(200)
              .expect((resp) => {
                const received = resp.body;
                if (received.firstName !== author.firstName) {
                  throw new Error(`First name missmatch: expected '${author.firstName}', but received ${received.firstName}`);
                }

                if (received.lastName !== author.lastName) {
                  throw new Error(`First name missmatch: expected '${author.lastName}', but received ${received.lastName}`);
                }
                return done();
              });
    });

    it('should return 404 if author not found', async (done) => {
      const author = plainToClass(Author, {
        firstName: 'John',
        lastName: 'Smith',
        birthday: '1991-01-08',
      });

      await authorRepo.save(author);

      return request(app.getHttpServer())
        .get(`/authors/5d538552fc96fc556655b7d3`)
        .expect(404)
        .expect((resp) => {
          if (resp.body.error !== 'Not Found') {
            throw new Error('Author has been found');
          }
          return done();
        });
    });
  });

  describe('GET /authors/:id/books', () => {
    it('should return the list of books that belongs to an author', async (done) => {
      const author = plainToClass(Author, {
        firstName: 'John',
        lastName: 'Smith',
        birthdate: '1981-01-08',
      });

      await authorRepo.save(author);

      const book = plainToClass(Book, {
        title: 'Test title',
        iban: 'testibannumber',
        authorID: author.id,
        publishedAt: new Date('1998-01-03'),
      });

      await bookRepo.save(book);

      return request(app.getHttpServer())
              .get(`/authors/${author.id}/books`)
              .expect(200)
              .expect((resp) => {
                const receivedBook = resp.body[0];

                if (receivedBook.title !== book.title) {
                  throw new Error(`Expected title ${book.title}, but received ${receivedBook.title}`);
                }
                if (receivedBook.iban !== book.iban) {
                  throw new Error(`Expected iban ${book.title}, but received ${receivedBook.title}`);
                }

                return done();
              });
    });
  });

  describe('PATCH /authors/:id', () => {
    it('should update an author if the author found', async (done) => {
      const author = plainToClass(Author, {
        firstName: 'John',
        lastName: 'Smith',
        birthdate: new Date('1991-01-08'),
      });

      await authorRepo.save(author);

      return request(app.getHttpServer())
               .patch(`/authors/${author.id}`)
               .send({
                 firstName: 'Joe',
               })
               .expect(200)
               .expect((resp) => {
                 const received = resp.body;
                 if (received.firstName !== 'Joe') {
                   throw new Error(`First name missmatch: expected 'Joe', but received ${received.firstName}`);
                 }
                 return done();
               });
    });

    it('should return 404 if author not found', async (done) => {
      return request(app.getHttpServer())
              .patch(`/authors/5d538552fc96fc556655b7d3`)
              .send({
                firstName: 'Joe',
              })
              .expect(404)
              .expect((resp) => {
                if (resp.body.error !== 'Not Found') {
                  throw new Error('Author was found');
                }
                return done();
              });
    });
  });

  describe('DELETE /authors/:id', () => {
    it('should delete an author if the author found', async () => {
      const author = plainToClass(Author, {
        firstName: 'John',
        lastName: 'Smith',
        birthdate: new Date('1991-01-08'),
      });

      await authorRepo.save(author);

      return request(app.getHttpServer())
               .delete(`/authors/${author.id}`)
               .expect(204);
    });

    it('should return 404 if did not found the author', async (done) => {
      return request(app.getHttpServer())
              .delete(`/authors/5d538552fc96fc556655b7d3`)
              .expect(404)
              .expect((resp) => {
                if (resp.body.error !== 'Not Found') {
                  throw new Error('Author was found');
                }
                return done();
              });
    });
  });

  describe('GET /books/:id', () => {
    it('should return a book', async (done) => {
      const book = plainToClass(Book, {
        title: 'Test title',
        iban: 'testibannumber',
        authorID: '5d53acd44dc1505ea09413c5',
        publishedAt: new Date('1998-01-03'),
      });

      await bookRepo.save(book);

      return request(app.getHttpServer())
              .get(`/books/${book.id}`)
              .expect(200)
              .expect((resp) => {
                const received = resp.body;
                if (received.title !== book.title) {
                  throw Error(`Expected title: ${book.title}, received: ${received.title}`);
                }
                if (received.iban !== book.iban) {
                  throw Error(`Expected iban: ${book.iban}, received: ${received.iban}`);
                }
                return done();
              });
    });

    it('should return 404 if book not found', async (done) => {
      return request(app.getHttpServer())
              .get('/books/5d538552fc96fc556655b7d3')
              .expect(404)
              .expect((resp) => {
                if (resp.body.error !== 'Not Found') {
                  throw new Error('Book has been found');
                }
                return done();
              });
    });
  });

  describe('POST /books', () => {
    it('should return 201 if book was created', async (done) => {
      const book = {
        authorID: '5d523698f3176c29bc8dbfc6',
        title: 'Test book',
        iban: 'random_test_iban',
        publishedAt: '1998-01-03',
      }

      return request(app.getHttpServer())
              .post('/books')
              .send(book)
              .expect(201)
              .expect((resp) => {
                const received = resp.body;
                if (received.title !== book.title) {
                  throw Error(`Expected title: ${book.title}, received: ${received.title}`);
                }
                if (received.iban !== book.iban) {
                  throw Error(`Expected iban: ${book.iban}, received: ${received.iban}`);
                }
                return done();
              });
    });

    it('should return 400 if an array was sent', async (done) => {
      const book = {
        authorID: '5d523698f3176c29bc8dbfc6',
        title: 'Test book',
        iban: 'random_test_iban',
        publishedAt: '1998-01-03',
      };

      return request(app.getHttpServer())
              .post('/books')
              .send([book])
              .expect(400)
              .expect((resp) => {
                if (resp.body.error !== 'Bad Request') {
                  throw new Error('Failed bad request');
                }
                return done();
              })
    });

    it('should return 422 if at least one of the required have wrong value', async (done) => {
      return request(app.getHttpServer())
              .post('/books')
              .send({
                authorID: '5d523698f3176c29bc8dbfc6',
                title: 23412321,
                iban: 'random_test_iban',
                publishedAt: '1998-01-03',
              })
              .expect(422)
              .expect(() => {
                return done();
              });
    })
  });

  describe('PATCH /books/:id', () => {
    it('should update a book', async (done) => {
      const book = plainToClass(Book, {
        title: 'Test title',
        iban: 'testibannumber',
        authorID: '5d53acd44dc1505ea09413c5',
        publishedAt: new Date('1998-01-03'),
      });

      await bookRepo.save(book);

      return request(app.getHttpServer())
              .patch(`/books/${book.id}`)
              .send({
                title: 'Test updated title',
                authorID: '5d53acd44dc1505ea09413c7',
              })
              .expect(200)
              .expect((resp) => {
                const received = resp.body;

                if (received.title !== 'Test updated title') {
                  throw new Error('Update books does not work as expected')
                }

                return done()
              });
    });

    it('should return 404 if book not found', async () => {
      return request(app.getHttpServer())
              .patch('/books/5d53acd44dc1505ea09413c5')
              .expect(404);
    });

    it('should return 400 if an array was sent', async () => {
      const book = plainToClass(Book, {
        title: 'Test title',
        iban: 'testibannumber',
        authorID: '5d53acd44dc1505ea09413c5',
        publishedAt: new Date('1998-01-03'),
      });

      await bookRepo.save(book);

      return request(app.getHttpServer())
              .patch(`/books/${book.id}`)
              .send([
                { title: 'random_data' },
              ])
              .expect(400);
    });

    it('should return 422 if some of fields have incorrect data', async () => {
      const book = plainToClass(Book, {
        title: 'Test title',
        iban: 'testibannumber',
        authorID: '5d53acd44dc1505ea09413c5',
        publishedAt: new Date('1998-01-03'),
      });

      await bookRepo.save(book);

      return request(app.getHttpServer())
              .patch(`/books/${book.id}`)
              .send({ title: 43_3232 })
              .expect(422);
    }); 
  });

  describe('DELETE /books/:id', () => {
    it('should return 204 if book record have been deleted', async () => {
      const book = plainToClass(Book, {
        title: 'Test title',
        iban: 'testibannumber',
        authorID: '5d53acd44dc1505ea09413c5',
        publishedAt: new Date('1998-01-03'),
      });

      await bookRepo.save(book);

      return request(app.getHttpServer())
              .delete(`/books/${book.id}`)
              .expect(204);
    });

    it('should return 404 if no book found', async () => {
      return request(app.getHttpServer())
              .delete('/books/5d53acd44dc1505ea09413c5')
              .expect(404);
    })
  })
});
