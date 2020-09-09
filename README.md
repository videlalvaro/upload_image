# Image Upload with Serverless and Static Web Apps

This project showcases how to upload images to Azure Blob Storage using [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/?WT.mc_id=readme-github-alvidela) & [Azure Functions](https://docs.microsoft.com/azure/azure-functions/?WT.mc_id=readme-github-alvidela).

To upload an image to [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/storage-blobs-introduction?WT.mc_id=readme-github-alvidela) we need to have a SAS key that would allow us to anonymously authenticate from the browser. For that we have an Azure Function that generates SAS keys and delivers them to the browser via Ajax.

If you don't have an Azure account, register one for free [here](https://azure.microsoft.com/free/?WT.mc_id=readme-github-alvidela)