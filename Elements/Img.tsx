import {useState, useEffect} from "react";
import {Image} from "react-native";
import gdata from "../gData";

export default ({source,style}:{source:any,style:any,onchange:Function})=> {
	const [s, setS] = useState(source.icon);
  source.onchange=(source)=>setS(source.icon)
	return (
	<Image source={{uri: s}} style={style} />
	)
	}