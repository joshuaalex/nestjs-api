import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService){}
    
    getBookmarks(userId: number){
        return this.prisma.bookmark.findMany({
            where: {
                userId
            }
        })
    }

    getBookmarkById(userId: number, bookmarkId: number){
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId
            }
        })
    }

    async createBookmark(userId: number, dto: CreateBookmarkDto){
        const bookmark = this.prisma.bookmark.create({
            data:{
                userId,
                ...dto
            }
        })
        
        return bookmark;
    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto){
        // get bookmark by Id
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })
        //check if the user owns the bookmark
        if(!bookmark || bookmark.userId !== userId)
        throw new ForbiddenException('Access to resources denied!');

        // modify and return the bookmark 
        return this.prisma.bookmark.update({
            where:{
                id: bookmarkId,
            },
            data:{
                ...dto
            }
        })
    }

    async deleteBookmarkById(userId: number, bookmarkId: number){

        //find the bookmard by id
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })
        //check if the user owns the bookmark
        if(!bookmark || bookmark.userId !== userId)
        throw new ForbiddenException('Access to resources denied!');
 
        //delete the bookmark
         await this.prisma.bookmark.delete({
            where:{
                id:bookmarkId
            }
         })

    }
}
