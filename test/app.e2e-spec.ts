import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpCode, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () =>{
  let app: INestApplication;
  let prisma : PrismaService;
  beforeAll( async ()=> {
    const moduleRef =
    await Test.createTestingModule({
      imports: [ AppModule ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(()=> {
    app.close();
  })
  
  describe('Auth', ()=>{
    const dto:AuthDto = {
      email: 'vlid@gmail.com',
      password: '123',
    };
    describe('SignUp', ()=>{
      it('should throw error if email is empty', ()=>{
        return pactum
        .spec()
        .post('/auth/signup')
        .withBody(dto.password)
        .expectStatus(400);
      })
      it('should throw error if password is empty', ()=>{
        return pactum
        .spec()
        .post('/auth/signup')
        .withBody(dto.email)
        .expectStatus(400);
      })
      it('should throw error if no body', ()=>{
        return pactum
        .spec()
        .post('/auth/signup')
        .expectStatus(400);
      })
      it('should sign up', ()=>{
        return pactum
        .spec()
        .post('/auth/signup')
        .withBody(dto)
        .expectStatus(201);
      })
    });


    describe('Signin', ()=>{
      it('should throw error if email is empty', ()=>{
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto.password)
        .expectStatus(400);
      })
      it('should throw error if password is empty', ()=>{
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto.email)
        .expectStatus(400);
      })
      it('should throw error if no body', ()=>{
        return pactum
        .spec()
        .post('/auth/signin')
        .expectStatus(400);
      })
      it('should signin', ()=>{
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', ()=>{
    describe('Get Me', ()=>{
      it('Should get current user', ()=>{
        return pactum
        .spec()
        .get('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
      })
    });
    describe('Edit User', ()=>{
      const dto: EditUserDto ={
        firstName:"joshua",
        email: "joshuaalex@gmail.com"
      }
      it('Should edit user by id', ()=>{
        return pactum
        .spec()
        .patch('/users')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
      })
    });
  });

  describe('Bookmarks', ()=>{

    describe('Get empty Bookmark', ()=>{
      it('Should get empty bookmarks', ()=>{
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBody([])
      })
    });

    describe('Create Bookmark', ()=>{
      const dto:CreateBookmarkDto = {
        title:'First Bookmark',
        link: 'https://www.youtube.com/watch?v=RVApkrYMcAg',
      }
      it('should create bookmark', ()=>{
        return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('bookmarkId', 'id')
      })
    });
    
    describe('Get Bookmark', ()=>{
      it('Should get bookmarks', ()=>{
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(1)
      })
    });

    describe('Get Bookmark by Id', ()=>{
      it('Should get bookmarks', ()=>{
        return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
      })
    });

    describe('Edit Bookmark', ()=>{
      const dto:EditBookmarkDto = {
        title:'Kubernetic Tutorials',
        description: 'here is just the description of the tutorials',
      }
      it('Should edit bookmarks by Id', ()=>{
        return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
      })
    });

    describe('Delete Bookmark', ()=>{
      it('Should delete bookmarks by Id', ()=>{
        return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(204)
      })

      it('should get empty bookmark', ()=>{
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(0)
      })
    });

  });
});