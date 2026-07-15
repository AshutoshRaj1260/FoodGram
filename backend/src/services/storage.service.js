const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadFile(file, fileName) {
    const result = await imagekit.upload({
        file: file, // required
        fileName: fileName, // required
    })

    return result; 
}

async function deleteFile(fileUrl) {
    if (!fileUrl) return;
    try {
        const urlParts = fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        const files = await imagekit.listFiles({
            searchQuery: `name = "${fileName}"`
        });

        if (files && files.length > 0) {
            const fileId = files[0].fileId;
            await imagekit.deleteFile(fileId);
        }
    } catch (error) {
        console.error("Error deleting file from storage:", error);
    }
}

module.exports = {
    uploadFile,
    deleteFile
}