import {useState, useEffect} from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import gdata from "./gData";
import HtmlInspector from "./Elements/HtmlInspector";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

export default function App() {
	gdata.hook("size.screen");
	useEffect(()=>{
	const subscription = Dimensions.addEventListener(
	'change',
	({window, screen}) => {
	gdata.size.screen.height = screen.height;
	gdata.size = {screen, window}
	}
	);
	return () => subscription?.remove();
	}, [])
	return (
	<ActionSheetProvider>
	<>
	<StatusBar hidden={true} />
	<HtmlInspector />
	</>
	</ActionSheetProvider>
	);
	}

	const styles = StyleSheet.create({
	container: {
	flex: 1,
	backgroundColor: '#fff',
	alignItems: "flex-end",
	justifyContent: "flex-end"
	},
	});