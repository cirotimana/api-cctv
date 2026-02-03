const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const config = require("../../../config.json");

// configuracion inicial con credenciales base
const stsClient = new STSClient({
  region: process.env.AWS_REGION || config.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || config.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY || config.AWS_SECRET_KEY,
  },
});

// Obtiene un cliente S3 con credenciales temporales (AssumeRole)
const getS3ClientWithRole = async () => {
  try {
    const command = new AssumeRoleCommand({
      RoleArn: process.env.AWS_ROLE_ARN || config.AWS_ROLE_ARN,
      RoleSessionName: "cctv-session",
    });

    const response = await stsClient.send(command);

    return new S3Client({
      region: process.env.AWS_REGION || config.AWS_REGION,
      credentials: {
        accessKeyId: response.Credentials.AccessKeyId,
        secretAccessKey: response.Credentials.SecretAccessKey,
        sessionToken: response.Credentials.SessionToken,
      },
    });
  } catch (error) {
    console.error("Error asumiendo rol AWS:", error);
    throw error;
  }
};

// Genera una URL firmada para un objeto en S3
const getPresignedUrl = async (key) => {
  try {
    const s3Client = await getS3ClientWithRole();
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || config.AWS_BUCKET_NAME,
      Key: key,
    });

    // URL valida por 15 minutos
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return url;
  } catch (error) {
    console.error("Error generando URL firmada:", error);
    return null;
  }
};

module.exports = {
  getPresignedUrl,
};
