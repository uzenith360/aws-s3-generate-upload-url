import { S3 } from 'aws-sdk';
import { UploadURLResult } from './upload-url-result.interface';

export default class AWSS3GenerateUploadURL {
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
        awsFileUploadURLExpiration: number
    ) {
        this.awsRegion = awsRegion;
        this.awsAccessKeyID = awsAccessKeyID;
        this.awsSecretAccessKey = awsSecretAccessKey;
        this.awsPublicBucketName = awsPublicBucketName;
        this.awsFileUploadURLExpiration = awsFileUploadURLExpiration || 900;

        this.s3Client = new S3(
            {
                region: this.awsRegion,
                signatureVersion: "v4",
                credentials: {
                    accessKeyId: this.awsAccessKeyID,
                    secretAccessKey: this.awsSecretAccessKey,
                },
            },
        );
    }

    generateS3UploadUrl(fileName: string, mimeType: string, extension: string, folderName?: string, metadata?: Record<string, unknown>): UploadURLResult {
        const key: string = `${!!folderName ? folderName + '/' : ''}${fileName}.${extension}`;
        const signedURL: string = this.s3Client.getSignedUrl(
            'putObject',
            {
                Key: key,
                Bucket: this.awsPublicBucketName,
                ContentType: mimeType,
                Expires: +this.awsFileUploadURLExpiration,
                Metadata: metadata,
                //   ACL: 'public-read',
            },
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
