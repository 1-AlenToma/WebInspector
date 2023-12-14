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
import { Zocial, AntDesign, FontAwesome } from '@expo/vector-icons';
import gdata from "../gData";
import methods from "../methods"
import WebView from "react-native-webview";
import { Asset, useAssets } from 'expo-asset';
import single from "../assets/single"
let s = single;
s += "\n"+ `
if(!window.inspectorloaded){
window.renderInspector();
window.inspectorloaded = true;
}
`
const onLoadInjected = `
if (document.readyState !== 'loading') {
window.ReactNativeWebView.postMessage('InjectNewCode');
} else {
document.addEventListener('DOMContentLoaded', function () {
window.ReactNativeWebView.postMessage('InjectNewCode');
});
}
`;
export type RefItem = {
url?:string,
back?: Function,
forward?:Function,
onScroll?: (value:number) => void;
}
export default ({refItem,width,height,onLoad}:{refItem:RefItem,width:number,height:number,onLoad:Funtion})=> {
	const r = useRef()

	const [text, setText] = useState("");
	const [search, setSearch] =
	useState(`https://www.google.com/search?q=&oq=&sourceid=chrome-mobile&ie=UTF-8`);
	const [icon, setIcon] = useState({uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${search}`})
	const onSubmit = ()=>{
	let google = `https://www.google.com/search?q=${text}&oq=${text}&sourceid=chrome-mobile&ie=UTF-8`+ text;
	if (methods.isValidUrl(text) != "")
	google = text;
	setSearch(google);
	}


	refItem.icon = icon;
	refItem.url = search;
	refItem.back = ()=> r.current?.goBack();
	refItem.forward = ()=> r.current?.goForward()

	useEffect(()=>{
	onLoad();
	}, [icon])

	const injectCode = ()=>{
	r.current?.injectJavaScript(s);
	}

	return (<View style={[{
		zIndex: 5,
		width: width,
		height: height,
		maxHeight: height,
		overflow: "hidden"
		}]}>
  <View style={[styles.tobBar, {
			width: width
			}]}>
			<FontAwesome style={styles.remove} onPress={()=> refItem.remove(refItem.id)} name="remove" size={20} color="red" />
     <TextInput
				selectTextOnFocus={true}
				keyboardType="url"
				disableFullscreenUI={true}
				placeholder="Search or type web address"
				onSubmitEditing={onSubmit}
				style={styles.input} value={text} onChangeText={setText} />
      <TouchableOpacity onPress={injectCode}>
      <Zocial style={styles.icon} name="html5" size={24} color="#fff" />
      </TouchableOpacity>
     </View>
  <WebView
			ref={r}
			onLoad={(syntheticEvent) => {
			const { nativeEvent } = syntheticEvent;
			setIcon({uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${nativeEvent.url}`})
			setText(nativeEvent.url)
			}}
			onMessage={ ({ nativeEvent }) => {
			if (nativeEvent.data === 'InjectNewCode') {
			injectCode()
			}
			}}
			style={[{
			width: width,
			height: height -80
			}]}
			onOpenWindow={(syntheticEvent) => {
			const { nativeEvent } = syntheticEvent;
			const { targetUrl } = nativeEvent
			setSearch(targetUrl)
			}}
			javaScriptEnabled={true}
			source={{ uri: search}}
			/>
  </View>
	)
	}

	const styles = StyleSheet.create({
	txt: {
	textAlign: "left",
	minWidth: "100%"
	},
	tobBar: {
	height: 80,
	width: "100%",
	justifyContent: "flex-start",
	display: "flex",
	alignItems: "flex-end",
	backgroundColor: "#2A272A",
	flexDirection: "row",
	overflow: "hidden"
	},

	icon: {
	width: 30,
	height: 30,
	position: "relative",
	top: -10
	},
	remove: {
	position: "relative",
	left: 10,
	top: -15
	},
	input: {
	borderWidth: 1,
	padding: 2,
	paddingLeft: 10,
	width: "85%",
	borderRadius: 5,
	backgroundColor: "gray",
	color: "white",
	marginBottom: 10,
	marginLeft: "5%",
	borderColor: "#4B4A54"
	},
	loading: {
	position: "absolute",
	top: "45%"
	}
	})