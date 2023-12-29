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
TouchableOpacity,
Image,
BackHandler
} from "react-native";
import uuid from 'react-native-uuid';
import { Zocial, Ionicons, Foundation} from '@expo/vector-icons';
import gdata from "../gData";
import methods from "../Methods"
import Web from "./Web.tsx";
import Icon from "./Img"
import { Asset, useAssets } from 'expo-asset';

export default ()=> {
	gdata.hook("sites", "currentSiteIndex", "screen");
	const add = ()=>{
	gdata.sites.push({
	icon: "https://s2.googleusercontent.com/s2/favicons?domain_url=www.google.com",
	remove: (id)=>{
	gdata.sites.slice(gdata.sites.findIndex(x=> x.id === id), 1);
	setIndex();
	},
	id: uuid.v4()
	});
	setIndex();
	}

	const setIndex = ()=>{
	if (gdata.sites.length > 0)
	gdata.currentSiteIndex = gdata.sites.length-1;
	else gdata.currentSiteIndex = 0;
	}

	const current = ()=>{
	return gdata.sites[gdata.currentSiteIndex]
	}

	useEffect(()=>{
	let backHandlerv = BackHandler.addEventListener("hardwareBackPress", ()=>{ current()?.back();
	  return true;
	})
	add();
	return ()=> backHandlerv.remove();
	}, [])
	return (<>
	<View style={[styles.folder, {
		height: gdata.size.window.height-50,
		width: gdata.size.window.width * gdata.sites.length,
		left: -(gdata.size.window.width * gdata.currentSiteIndex)
		}]}>
	  {
		gdata.sites.map(x=> (
		<Web
			refItem={x}
			key={x.id}
			width={gdata.size.window.width}
			height={gdata.size.window.height-50}
			onLoad={()=>{}} />
		))
		}
     </View>
	<View style={[styles.menu]}>
	{
		gdata.sites.map((x,i)=> (
		<TouchableOpacity style={styles.icon} key={x.id+"s"} onPress={()=>{
			gdata.currentSiteIndex = i;
			}}>
	  <Icon source={x} style={{width: 25, height: 25}} />
			</TouchableOpacity>
		))
		}
	<TouchableOpacity style={styles.left} onPress={()=>current()?.back()}>
	<Ionicons name="caret-back" size={30} color="white" />
	</TouchableOpacity>
	<TouchableOpacity onPress={add} style={styles.right}>
	<Foundation name="plus" size={30} color="white" />
	</TouchableOpacity>
	</View>
	</>
	)
	}

	const styles = StyleSheet.create({
	folder: {
	display: "flex",
	flexDirection: "row",
	justifyContent: "flex-start",
	position: "relative",
	zIndex: 1
	},

	left: {
	position: "absolute",
	left: 10
	},
	right: {
	position: "absolute",
	right: 10
	},
	menu: {
	width: "100%",
	height: 50,
	display: "flex",
	flexDirection: "row",
	backgroundColor: "#151313ed",
	borderWidth: 0,
	borderColor: "#ccc",
	zIndex: 2,
	alignItems: "center",
	justifyContent: "center",
	//position: "absolute",
	bottom: 0
	},
	icon: {
	width: 30,
	height: 30,
	position: "relative",
	borderWidth: 1,
	borderColor: "#ccc",
	borderRadius: 3,
	marginRight: 4,
	display: "flex",
	justifyContent: "center",
	alignItems: "center"
	}
	})