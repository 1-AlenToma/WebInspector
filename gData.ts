import GlobalState from "react-global-state-management";
import { Dimensions } from "react-native";
const data = GlobalState(
    {
        size: {
            screen: Dimensions.get("screen"),
            window: Dimensions.get("window")
        },
        sites: [],
        currentSiteIndex: 0
    }
);

export default data;
