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
Linking,
Keyboard
} from "react-native";
import {
Zocial,
AntDesign,
FontAwesome,
Ionicons,
MaterialIcons,
MaterialCommunityIcons

} from '@expo/vector-icons';
import gdata from "../gData";
import methods from "../Methods";
import WebView from "react-native-webview";
import { Asset, useAssets } from 'expo-asset';
import single from "../assets/single";
import AnimatedView from "./AnimateWidth";
import { useActionSheet } from '@expo/react-native-action-sheet';
let LoadingIndicatorView = ()=> {
return (
<ActivityIndicator
	color="#009b88"
	size="large"
	style={{
	flex: 1,
	justifyContent: 'center',
	position: "absolute",
	top: "45%",
	left: "45%"
	}}
	/>
);
}
const lib = `
window.debugMode=true;
setTimeout(()=>{
if(!window.renderInspector){
${single};
}
},100)
true;
`;
export type RefItem = {
url?:string,
back?: Function,
forward?:Function,
onScroll?: (value:number) => void;
}
export default (
	{
	refItem,
	width,
	height,
	onLoad
	}: {refItem: RefItem, width: number, height: number, onLoad: Funtion})=> {
	const r = useRef();
	const timer = useRef();
	const { showActionSheetWithOptions } = useActionSheet();

	const animatedValues = useRef({v0: {}, v1: {}})
	const [emEnabled, setEmEnabled] = useState(false);
	const [focusIn, setFocusIn] = useState();
	const [text, setText] = useState("");
	const [data, setData] = useState([]);
	const [kStatus, setkStatus] = useState(false);
	const [search, setSearch] =
	useState(`https://www.google.com/search?q=&oq=&sourceid=chrome-mobile&ie=UTF-8`);
	const [icon, setIcon] = useState({uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${search}`});



	const onSubmit = (txt)=>{
	txt = text || txt;
	let google = `https://www.google.com/search?q=${txt}&oq=${txt}&sourceid=chrome-mobile&ie=UTF-8`+ txt;
	if (methods.isValidUrl(txt))
	google = txt;
	setSearch(google);
	Keyboard.dismiss();
	}

	const showMenu = () => {
	const options = ['Privacy Policy', 'GitHub', 'Cancel'];
	const destructiveButtonIndex = 0;
	const cancelButtonIndex = 2;
	const icons = [
	<MaterialIcons name="privacy-tip" size={24} color="black" />,
	<MaterialCommunityIcons name="information" size={24} color="black" />,
	<MaterialCommunityIcons name="cancel" size={24} color="black" />
	]
	showActionSheetWithOptions({
	options,
	cancelButtonIndex,
	destructiveButtonIndex,
	icons
	}, (selectedIndex: number) => {
	switch (selectedIndex) {
case 0:
	Linking.openURL("https://htmlpreview.github.io/?https://raw.githubusercontent.com/1-AlenToma/WebInspector/master/assets/Privacy.html");
	break;

case 1:
	Linking.openURL("https://github.com/1-AlenToma/WebInspector");
	break;

case cancelButtonIndex:
	// Canceled
	}});
	}


	refItem.url = search;
	refItem.back = ()=> r.current?.goBack();
	refItem.forward = ()=> r.current?.goForward()
	useEffect(()=> {
	injectCode();
	}, [emEnabled])

	useEffect(()=>{
	if (focusIn && text.length > 0 && !methods.isValidUrl(text))
	fetchData();
	}, [text])

	useEffect(()=>{
	refItem.icon = icon.uri;
	refItem?.onchange(refItem);
	onLoad();
	}, [icon])

	useEffect(()=>{
	const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
	setkStatus(true);
	});
	const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
	setkStatus(false);
	});

	return ()=> {
	hideSubscription.remove();
	showSubscription.remove();
	}
	}, [])

	useEffect(()=>{
	if (focusIn && kStatus){
	animatedValues.current.v0.show();
	animatedValues.current.v1.show();
	} else {
	animatedValues.current.v0.hide();
	animatedValues.current.v1.hide();
	}
	}, [focusIn, kStatus])

	const fetchData = async ()=>{
	clearTimeout(timer.current);
	timer.current = setTimeout(async ()=>{
	try{
	let t = text;
	let url = `http://suggestqueries.google.com/complete/search?client=chrome&q=${t}`;
	let res = await fetch(url);
	let json = await res.json();
	setData((json)[1]);
	}catch(e){
	console.error(e);
	alert(e);
	}
	}, 100)
	}

	const injectCode = ()=>{
	r.current?.injectJavaScript(emEnabled ? `window.renderInspector();
	true;`: `window.clearEmulator();
	true;`);
	}

	const messageHandler = async (data:any)=>{
	let json = JSON.parse(data);
	if (json.type == "download"){
	methods.writeFile(json.data).then(()=> alert("file downloaded")).catch(e=> alert(e))
	}
	}

	animatedValues.current.v0.width = methods.proc(90, width);
	animatedValues.current.v1.height = height;
	let status = (focusIn === true && kStatus === true);
	return (<View style={[{
		zIndex: 5,
		width: width,
		height: height,
		maxHeight: height,
		overflow: "hidden"
		}]}>
  <View style={[styles.tabBar, {
			width: width,
			zIndex: 11
			}]}>
		  <AnimatedView style={{width: "50%"}} refItem={animatedValues.current.v0}>
     <TextInput
				onFocus={()=> setFocusIn(true)}
				onBlur={()=> setFocusIn(false)}
				selectTextOnFocus={true}
				keyboardType="url"
				disableFullscreenUI={true}
				placeholder="Search or type web address"
				onSubmitEditing={onSubmit}
				style={styles.input} value={text}
				onChangeText={setText} />
				</AnimatedView>
				{
			status ? null:
			<View style={styles.buttons}>
			<TouchableOpacity style={styles.icon} onPress={()=> refItem.remove(refItem.id)}>
				<FontAwesome name="remove" size={24} color="red" />
				</TouchableOpacity>
			<TouchableOpacity style={styles.icon} onPress={()=>setEmEnabled(!emEnabled)}>
      <Zocial name="html5" size={24} color={emEnabled ?"red": "#ffffff"} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon} onPress={showMenu}>
      <Ionicons name="menu" size={24} color="#ffffff" />
      </TouchableOpacity>
      </View>
			}
     </View>
      <AnimatedView status={status} style={[
			{
			paddingTop: 80,
			zIndex: 10,
			overflow: "hidden",
			position: "absolute",
			width: "100%",
			alignItems: "flex-start",
			backgroundColor: "#2A272A",
			zIndex: 10,
			left: 0
			}]} refItem={animatedValues.current.v1}>
			{
			data?.map((x,i)=>(
			<TouchableOpacity style={styles.link} key={i} onPress={()=>{
				setText(x);
				onSubmit(x);
				}}>
				 <Text style={styles.txt}>{x}</Text>
				</TouchableOpacity>
			))
			}
			</AnimatedView>
  <WebView
			ref={r}
			onLoad={(syntheticEvent) => {
			const { nativeEvent } = syntheticEvent;
			setIcon({uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${nativeEvent.url}`})
			setText(nativeEvent.url)
			}}
			style={[{
			zIndex: 9,
			width: width,
			height: height -80
			}]}
			onMessage={(event) => {
			messageHandler(event.nativeEvent.data);
			}}
			setSupportMultipleWindows={true}
			renderLoading={LoadingIndicatorView}
			startInLoadingState={true}
			onLoadEnd={injectCode()}
			onOpenWindow={(syntheticEvent) => {
			const { nativeEvent } = syntheticEvent;
			const { targetUrl } = nativeEvent
			//alert(targetUrl);
			setSearch(targetUrl)
			}}
			onShouldStartLoadWithRequest={request => {
			// short circuit these
			if (!request.url ||
			request.url.startsWith('http') ||
			request.url.startsWith('https') ||
			request.url.startsWith("/") ||
			request.url.startsWith("#") ||
			request.url.startsWith("javascript") ||
			request.url.startsWith("about:blank")
			) {
			return true;
			}

			// blocked blobs
			if (request.url.startsWith("blob")){
			alert("Link cannot be opened.");
			return false;
			}

			// list of schemas we will allow the webview
			// to open natively
			if (request.url.startsWith("tel:") ||
			request.url.startsWith("mailto:") ||
			request.url.startsWith("maps:") ||
			request.url.startsWith("geo:") ||
			request.url.startsWith("sms:") ||
			request.url.startsWith("intent:")
			){

			Linking.openURL(text).catch(er => {
			alert("Failed to open Link: " + er.message);
			});
			return false;
			}

			// let everything else to the webview
			return true;
			}}
			injectedJavaScriptBeforeContentLoadedForMainFrameOnly={true}
			injectedJavaScriptBeforeContentLoaded={lib}
			javaScriptEnabled={true}
			domStorageEnabled={true}
			mixedContentMode="always"
			allowsFullscreenVideo={true}
			allowFileAccessFromFileURLs={true}
			allowUniversalAccessFromFileURLs={true}
			allowingReadAccessToURL={true}
			cacheEnabled={true}
			allowsLinkPreview={true}
			originWhitelist={['*']}
			allowsBackForwardNavigationGestures={true}
			source={{ uri: search}}

			/>
		</View>
	)
	}

	const styles = StyleSheet.create({
	txt: {
	textAlign: "left",
	minWidth: "100%",
	color: "#ffffff",
	fontSize: 13,
	fontWeight: "bold",
	},
	tabBar: {
	height: 50,
	width: "100%",
	justifyContent: "flex-start",
	display: "flex",
	alignItems: "flex-end",
	backgroundColor: "#2A272A",
	flexDirection: "row",
	overflow: "hidden"
	},

	link: {
	paddingLeft: 5,
	width: "100%",
	height: 30,
	borderBottomColor: "#6e6e6ecc",
	borderBottomWidth: 1,
	display: "flex",
	alignItems: "center",
	justifyContent: "center"
	},

	icon: {
	width: 35,
	height: 35,
	position: "relative",
	top: -10,
	zIndex: 1,
	borderWidth: 1,
	borderColor: "#ccc",
	borderRadius: 5,
	alignItems: "center",
	justifyContent: "center",
	marginLeft: 10
	},
	buttons: {
	flexDirection: "row",
	justifyContent: "flex-end",
	display: "flex",
	width: "50%",
	alignItems: "center"
	},

	input: {
	borderWidth: 1,
	padding: 2,
	paddingLeft: 10,
	width: "100%",
	borderRadius: 5,
	backgroundColor: "gray",
	color: "white",
	marginBottom: 10,
	marginLeft: "5%",
	borderColor: "#4B4A54",
	overflow: "visible",
	zIndex: 1
	},
	loading: {
	position: "absolute",
	top: "45%"
	}
	})