const {
    StorageSharedKeyCredential,
    ContainerSASPermissions,
    generateBlobSASQueryParameters
} = require("@azure/storage-blob");
const { extractConnectionStringParts } = require('./utils.js');

module.exports = async function (context, req) {
    const permissions = 'c';
    const container = 'images';
    const connStringParts = extractConnectionStringParts(process.env.AzureWebJobsStorage)
    context.res = {
        body: generateSasToken(connStringParts, container, permissions)
    };
    context.done();
};

function generateSasToken(connStringParts, container, permissions) {
    const connString = connStringParts.accountKey.toString('base64');
    const sharedKeyCredential = new StorageSharedKeyCredential(connStringParts.accountName, connString);

    var expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 2);

    const sasKey = generateBlobSASQueryParameters({
        containerName: container,
        permissions: ContainerSASPermissions.parse(permissions),
        expiresOn: expiryDate,
    }, sharedKeyCredential).toString();

    return {
        sasKey: sasKey,
        url: connStringParts.url
    };
}