import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

const isValidUrl = urlString => {
    var urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // validate protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
            "(\\#[-a-z\\d_]*)?$",
        "i"
    ); // validate fragment locator
    return !!urlPattern.test(urlString);
};

const getDirectoryPermissions = async => {
    return new Promise(async (resolve, reject) => {
        try {
            const initial =
                FileSystem.StorageAccessFramework.getUriForDirectoryInRoot();

            const permissions =
                await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                    initial
                );
            let settings = {
                downloadsFolder: permissions.granted
                    ? permissions.directoryUri
                    : null
            };
            // Unfortunately, StorageAccessFramework has no way to read a previously specified folder without popping up a selector.
            // Save the address to avoid asking for the download folder every time

            return resolve(
                permissions.granted ? permissions.directoryUri : null
            );
        } catch (e) {
            console.log("Error in getDirectoryPermissions", e);
            return resolve(null);
        }
    });
};

const writeFile = async text => {
    let { status } = await MediaLibrary.requestPermissionsAsync();
    const androidSDK = Platform.constants.Version;
    let downloadsFolder = null;
    if (Platform.OS === "android" && androidSDK >= 30) {
        //Except for Android 11, using the media library works stably
        downloadsFolder = await getDirectoryPermissions();
        //if (settings) downloadsFolder = settings;
        //if (settings) downloadsFolder = settings + "/";
        // console.log(settings);
    }
    if (Platform.OS === "android" && downloadsFolder) {
        // Creating files using SAF
        // I think this code should be in the documentation as an example
        const fileString = text;
        const newFile = await FileSystem.StorageAccessFramework.createFileAsync(
            downloadsFolder,
            "site.txt",
            "text/plain"
        );
        await FileSystem.writeAsStringAsync(newFile, fileString, {
            encoding: FileSystem.EncodingType.UTF8
        });
    } else {
        let fileUri = FileSystem.documentDirectory + "text.txt";
        await FileSystem.writeAsStringAsync(fileUri, text, {
            encoding: FileSystem.EncodingType.UTF8
        });
        // Creating files using MediaLibrary
        const asset = await MediaLibrary.createAssetAsync(fileUri);
    }
};

export default {
    isValidUrl,
    writeFile
};
