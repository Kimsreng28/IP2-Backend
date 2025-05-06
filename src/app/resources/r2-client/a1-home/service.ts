// ===========================================================================>> Core Library
import { Injectable } from '@nestjs/common';
import { FileService } from 'src/app/services/file.service';

// ===========================================================================>> Third Party Library

// ===========================================================================>> Custom Library
@Injectable()
export class HomeService {

    constructor(private readonly fileService: FileService) { };
    // async create(): Promise<any> {
       
    //     const result = await this.fileService.uploadBase64Image('product', body.image);
    //     if (result.error) {
    //         throw new BadRequestException(result.error);
    //     }
    //     // Replace base64 string by file URI from FileService
    //     body.image = result.file.uri;

        
    //     return {
    //         message: 'Product has been created.'
    //     };
    // }
}
