import * as React from "react";
import {
useState,
useEffect,
useRef
} from "react";
import {
TextInput,
Text,
View,
ScrollView,
ActivityIndicator,
StyleSheet,
button,
TouchableOpacity
} from "react-native";
import { Zocial } from '@expo/vector-icons';
import gdata from "../gData";
import methods from "../methods"
import Web from "./Web.tsx";
import { Asset, useAssets } from 'expo-asset';

export default ()=> {
	const r = useRef({})
	return (<>
	<View style={[styles.folder, {height: "100%", width: "100%"}]}>
		<Web refItem={r.current} width={gdata.windowSize.width} height={gdata.windowSize.height} onLoad={()=>{}} />
     </View>
	</>
	)
	}

	const styles = StyleSheet.create({
	folder: {
	display: "flex",
	flexDirection: "row"
	},
	icon: {
	width: 30,
	height: 30,
	position: "relative",
	top: -10
	}
	})