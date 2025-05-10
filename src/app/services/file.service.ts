import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { firstValueFrom } from 'rxjs';

// Response type of File V4
interface File {
  name: string;
  uri: string;
  mimetype: string;
  size: number;
}

// Request bodies types
interface UploadBase64ImageBody {
  folder: string;
  avatar: string;
}

// Union type for request bodies
type RequestBody = UploadBase64ImageBody | FormData;

@Injectable()
export class FileService {
  private fileBaseUrl = process.env.FILE_BASE_URL;
  private fileUsername = process.env.FILE_USERNAME;
  private filePassword = process.env.FILE_PASSWORD;

  constructor(private readonly httpService: HttpService) {}

  private async sendRequest(
    url: string,
    data: RequestBody,
    headers: Record<string, string>,
  ) {
    const result: { file?: File; error?: string } = {};
    try {
      // Convert Observable to Promise by using firstValueFrom() method
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }),
      );
      result.file = response.data.data;
    } catch (error) {
      result.error = error?.response?.data?.message || 'Something went wrong';
    }
    return result;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Basic ${Buffer.from(`${this.fileUsername}:${this.filePassword}`).toString('base64')}`,
    };
  }

  public async uploadBase64Image(folder: string, base64: string) {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

    const body: UploadBase64ImageBody = {
      folder: folder,
      avatar: base64Data,
    };

    const headers = {
      ...this.getAuthHeaders(),
      'Content-Type': 'application/json', // ✅ Explicitly set this!
    };

    return await this.sendRequest(
      this.fileBaseUrl + '/api/file/upload-single',
      body,
      headers,
    );
  }

  public async uploadImage(file: Express.Multer.File) {
    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const headers = {
      ...form.getHeaders(),
      ...this.getAuthHeaders(),
    };

    try {
      const response = await axios.post(
        `${this.fileBaseUrl}/api/file/upload-single`,
        form,
        { headers },
      );

      // Ensure response matches what your Go backend returns
      return {
        file: {
          uri: response.data?.file?.uri || `/uploads/${file.originalname}`,
        },
        path: response.data?.path || `/uploads/${file.originalname}`,
      };
    } catch (err) {
      console.error(
        '[FileService] Upload failed:',
        err.response?.data || err.message,
      );
      return {
        error: err.response?.data?.error || 'File upload failed',
        file: null,
        path: null,
      };
    }
  }

  // Upload image specifically for products
  // Upload multiple product images
  public async uploadMultipleProductImages(files: Express.Multer.File[]) {
    const results = [];

    for (const file of files) {
      const form = new FormData();
      form.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const headers = {
        ...form.getHeaders(),
        ...this.getAuthHeaders(),
      };

      try {
        // Send the POST request to upload the image
        const response = await axios.post(
          `${this.fileBaseUrl}/api/file/product/upload-image`, // Update this URL if necessary
          form,
          { headers },
        );

        // Handle the successful response and store metadata
        const fileMetadata = response.data?.data ?? {};
        results.push({
          file: {
            uri: fileMetadata.uri ?? `/uploads/products/${file.originalname}`,
            path: fileMetadata.path ?? `/uploads/products/${file.originalname}`,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          },
        });
      } catch (err) {
        console.error(
          '[FileService] Image upload failed:',
          err.response?.data ?? err.message,
        );

        // Handle errors and push them to the result
        results.push({
          error: err.response?.data?.error ?? 'Image upload failed',
          file: null,
          path: null,
        });
      }
    }

    return results;
  }
}
