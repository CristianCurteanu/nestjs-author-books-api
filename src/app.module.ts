import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthorsModule } from './authors/authors.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './authors/authors.model';

@Module({
  imports: [
    AuthorsModule,
    TypeOrmModule.forRoot({
      type: 'mongodb',
      useNewUrlParser: true,
      url: 'mongodb://localhost:27017/authors_api',
      entities: [
        Author,
      ],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
