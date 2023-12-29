import blacklist from "react-native/packager/blacklist";

export default {
    getBlacklistRE: () =>
        blacklist([
            "/inspector_js_files/**"
        ])
};
