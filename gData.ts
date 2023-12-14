import GlobalState from 'react-global-state-management';
import {
  Dimensions
} from "react-native";
const data = GlobalState({
  screenSize: Dimensions.get("screen"),
  windowSize: Dimensions.get("window")
});

export default data;