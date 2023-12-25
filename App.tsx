import {useState, useEffect} from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import gdata from "./gData";
import HtmlInspector from "./Elements/HtmlInspector"

export default function App() {
	gdata.hook("windowSize");
	useEffect(()=>{
	const subscription = Dimensions.addEventListener(
	'change',
	({window, screen}) => {
	gdata.screenSize = screen;
	gdata.windowSize = window;
	},
	);
	return () => subscription?.remove();
	}, [])
	return (
	<View style={styles.container}>
      <StatusBar hidden={true} />
      <HtmlInspector />
    </View>
	);
	}

	const styles = StyleSheet.create({
	container: {
	flex: 1,
	backgroundColor: '#fff',
	alignItems: "flex-start",
	justifyContent: "flex-start"
	},
	});