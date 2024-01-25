import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadURLResult } from './upload-url-result.interface';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';

export class AWSS3GenerateUploadURL {
    private static _instance: AWSS3GenerateUploadURL;

    private readonly s3Client: S3;

    private readonly awsRegion: string;
    private readonly awsAccessKeyID: string;
    private readonly awsSecretAccessKey: string;
    private readonly awsPublicBucketName: string;
    private readonly awsFileUploadURLExpiration: number;

    private constructor(
        awsRegion: string,
        awsAccessKeyID: string,
        awsSecretAccessKey: string,
        awsPublicBucketName: string,
        awsFileUploadURLExpiration: number,
    ) {
        this.awsRegion = awsRegion;
        this.awsAccessKeyID = awsAccessKeyID;
        this.awsSecretAccessKey = awsSecretAccessKey;
        this.awsPublicBucketName = awsPublicBucketName;
        this.awsFileUploadURLExpiration = awsFileUploadURLExpiration || 900;

        this.s3Client = new S3({
            region: this.awsRegion,

            // The key signatureVersion is no longer supported in v3, and can be removed.
            // @deprecated SDK v3 only supports signature v4.
            // signatureVersion: "v4",

            credentials: {
                accessKeyId: this.awsAccessKeyID,
                secretAccessKey: this.awsSecretAccessKey,
            },
        });
    }

    async generateS3UploadUrl(fileName: string, mimeType: string, extension: string, folderName?: string/*, metadata?: Record<string, unknown>*/): Promise<UploadURLResult> {
        const key: string = `${!!folderName ? folderName + '/' : ''}${fileName}.${extension}`;
        const signedURL: string = await getSignedUrl(
            this.s3Client,
            // 'putObject',
            new GetObjectCommand({
                Key: key,
                Bucket: this.awsPublicBucketName,
                ResponseContentType: mimeType,
                
                // ContentType: mimeType,

                // Expires: +this.awsFileUploadURLExpiration,
                // Metadata: metadata,

                // //   ACL: 'public-read',
            }),
            {
                expiresIn: +this.awsFileUploadURLExpiration,
            }
        );

        return {
            key,
            signedURL,
        };
    }

    public getS3Client(): S3 {
        return this.s3Client;
    }

    public static getInstance(
        awsRegion: string,
        awsAccessKeyID: string,
        awsSecretAccessKey: string,
        awsPublicBucketName: string,
        awsFileUploadURLExpiration: number
    ): AWSS3GenerateUploadURL {
        if (!AWSS3GenerateUploadURL._instance) {
            AWSS3GenerateUploadURL._instance = new AWSS3GenerateUploadURL(
                awsRegion,
                awsAccessKeyID,
                awsSecretAccessKey,
                awsPublicBucketName,
                awsFileUploadURLExpiration,
            );
        }

        return AWSS3GenerateUploadURL._instance;
    }
}
