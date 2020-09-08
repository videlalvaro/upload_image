/**
 * Extracts account name from the url
 * @param {string} url url to extract the account name from
 * @returns {string} with the account name
 */
function getAccountNameFromUrl(url) {
    var parsedUrl = URLBuilder.parse(url);
    var accountName;
    try {
        if (parsedUrl.getHost().split(".")[1] === "blob") {
            // `${defaultEndpointsProtocol}://${accountName}.blob.${endpointSuffix}`;
            accountName = parsedUrl.getHost().split(".")[0];
        }
        else {
            // IPv4/IPv6 address hosts... Example - http://192.0.0.10:10001/devstoreaccount1/
            // Single word domain without a [dot] in the endpoint... Example - http://localhost:10001/devstoreaccount1/
            // .getPath() -> /devstoreaccount1/
            accountName = parsedUrl.getPath().split("/")[1];
        }
        if (!accountName) {
            throw new Error("Provided accountName is invalid.");
        }
        return accountName;
    }
    catch (error) {
        throw new Error("Unable to extract accountName with provided information.");
    }
}
function getProxyUriFromDevConnString(connectionString) {
    // Development Connection String
    // https://docs.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string#connect-to-the-emulator-account-using-the-well-known-account-name-and-key
    var proxyUri = "";
    if (connectionString.search("DevelopmentStorageProxyUri=") !== -1) {
        // CONNECTION_STRING=UseDevelopmentStorage=true;DevelopmentStorageProxyUri=http://myProxyUri
        var matchCredentials = connectionString.split(";");
        for (var _i = 0, matchCredentials_1 = matchCredentials; _i < matchCredentials_1.length; _i++) {
            var element = matchCredentials_1[_i];
            if (element.trim().startsWith("DevelopmentStorageProxyUri=")) {
                proxyUri = element.trim().match("DevelopmentStorageProxyUri=(.*)")[1];
            }
        }
    }
    return proxyUri;
}
function getValueInConnString(connectionString, argument) {
    var elements = connectionString.split(";");
    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
        var element = elements_1[_i];
        if (element.trim().startsWith(argument)) {
            return element.trim().match(argument + "=(.*)")[1];
        }
    }
    return "";
}
/**
 * Extracts the parts of an Azure Storage account connection string.
 *
 * @export
 * @param {string} connectionString Connection string.
 * @returns {ConnectionString}  String key value pairs of the storage account's url and credentials.
 */
function extractConnectionStringParts(connectionString) {
    var proxyUri = "";
    if (connectionString.startsWith("UseDevelopmentStorage=true")) {
        // Development connection string
        proxyUri = getProxyUriFromDevConnString(connectionString);
        connectionString = DevelopmentConnectionString;
    }
    // Matching BlobEndpoint in the Account connection string
    var blobEndpoint = getValueInConnString(connectionString, "BlobEndpoint");
    // Slicing off '/' at the end if exists
    // (The methods that use `extractConnectionStringParts` expect the url to not have `/` at the end)
    blobEndpoint = blobEndpoint.endsWith("/") ? blobEndpoint.slice(0, -1) : blobEndpoint;
    if (connectionString.search("DefaultEndpointsProtocol=") !== -1 &&
        connectionString.search("AccountKey=") !== -1) {
        // Account connection string
        var defaultEndpointsProtocol = "";
        var accountName = "";
        var accountKey = Buffer.from("accountKey", "base64");
        var endpointSuffix = "";
        // Get account name and key
        accountName = getValueInConnString(connectionString, "AccountName");
        accountKey = Buffer.from(getValueInConnString(connectionString, "AccountKey"), "base64");
        if (!blobEndpoint) {
            // BlobEndpoint is not present in the Account connection string
            // Can be obtained from `${defaultEndpointsProtocol}://${accountName}.blob.${endpointSuffix}`
            defaultEndpointsProtocol = getValueInConnString(connectionString, "DefaultEndpointsProtocol");
            var protocol = defaultEndpointsProtocol.toLowerCase();
            if (protocol !== "https" && protocol !== "http") {
                throw new Error("Invalid DefaultEndpointsProtocol in the provided Connection String. Expecting 'https' or 'http'");
            }
            endpointSuffix = getValueInConnString(connectionString, "EndpointSuffix");
            if (!endpointSuffix) {
                throw new Error("Invalid EndpointSuffix in the provided Connection String");
            }
            blobEndpoint = defaultEndpointsProtocol + "://" + accountName + ".blob." + endpointSuffix;
        }
        if (!accountName) {
            throw new Error("Invalid AccountName in the provided Connection String");
        }
        else if (accountKey.length === 0) {
            throw new Error("Invalid AccountKey in the provided Connection String");
        }
        return {
            kind: "AccountConnString",
            url: blobEndpoint,
            accountName: accountName,
            accountKey: accountKey,
            proxyUri: proxyUri
        };
    }
    else {
        // SAS connection string
        var accountSas = getValueInConnString(connectionString, "SharedAccessSignature");
        var accountName = getAccountNameFromUrl(blobEndpoint);
        if (!blobEndpoint) {
            throw new Error("Invalid BlobEndpoint in the provided SAS Connection String");
        }
        else if (!accountSas) {
            throw new Error("Invalid SharedAccessSignature in the provided SAS Connection String");
        }
        else if (!accountName) {
            throw new Error("Invalid AccountName in the provided SAS Connection String");
        }
        return { kind: "SASConnString", url: blobEndpoint, accountName: accountName, accountSas: accountSas };
    }
}

module.exports = {
    extractConnectionStringParts: extractConnectionStringParts
}