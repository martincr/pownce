/*
label.js
modified from http://www.webmasterworld.com/forum21/12020.htm
*/

addEvent(window,"load",labels_init);
function labels_init(){
    if(document.getElementById&&document.styleSheets)
    {
        try{
            var s=document.styleSheets[document.styleSheets.length-1];
            addStyleRule(s,"label.inside","position:absolute; visibility:hidden;");
            for(var i=0,label=null;(label=document.getElementsByTagName("label")[i]);i++)
            {
                if(label.className=='inside'){
                    label_init(label);
                }
            }
            addEvent(document.forms[0],"submit",labels_uninit);
        }
        catch(e){}
        }
    }
function labels_uninit(e){
    if(document.getElementById&&document.styleSheets)
    {
        for(var i=0,label=null;(label=document.getElementsByTagName("label")[i]);i++)
        {
            var el=document.getElementById(label.htmlFor);
            if(el&&el.value==el._labeltext)label_hide(el);
        }
    }
}
function label_init(label){
    try{
        var el=document.getElementById(label.htmlFor);
        var elName=el.nodeName;var elType=el.getAttribute("type");
        if(elName=="TEXTAREA"||(elType=="text"||elType=="password"))
        {
            el._labeltext=label.firstChild.nodeValue;
            el._type=el.getAttribute("type");
            addEvent(el,"focus",label_focused);
            addEvent(el,"blur",label_blurred);
            label_blurred({currentTarget:el});
        }
        else{
            label.style.position="static";
            label.style.visibility="visible";
        }
    }
    catch(e){
        label.style.position="static";
        label.style.visibility="visible";
    }
}
function label_focused(e){
    e=fix_e(e);
    var el=e.currentTarget;
    if(el.value==el._labeltext || el._type=="password")
        el=label_hide(el)
    el.select();
}
function label_hide(el){
    if(el._type=="password")
        el=label_setInputType(el,"password");
    el.value="";
    return el;
}
function label_blurred(e){
    e=fix_e(e);
    var el=e.currentTarget;
    if(el.value=="")
        el=label_show(el);
}
function label_show(el){
    if(el._type=="password")
        el=label_setInputType(el,"text");
    el.value=el._labeltext;
    return el;
}
function label_setInputType(el,type){
    if(navigator.appName=="Microsoft Internet Explorer"){
        var newEl=document.createElement("SPAN");
        newEl.innerHTML='<input type="'+type+'" />';
        newEl=newEl.firstChild;var s='';
        for(prop in el){
            try{
                if(prop!="type"&&prop!="height"&&prop!="width")
                newEl[prop]=el[prop];
            }
            catch(e){}
        }
        addEvent(newEl,"focus",label_focused);
        addEvent(newEl,"blur",label_blurred);
        el.parentNode.replaceChild(newEl,el);
        return newEl;
    }else{
        el.setAttribute("type",type);
        return el;
    }
}
function addEvent(obj,evType,fn){
    if(obj.addEventListener){
        obj.addEventListener(evType,fn,false);
        return true;
    }else if(obj.attachEvent){
        var r=obj.attachEvent("on"+evType,fn);
        return r;
    }else{return false;}
}
function addStyleRule(stylesheet,selector,rule){
    if(stylesheet.addRule)
        stylesheet.addRule(selector,rule);
    else{
        var index=stylesheet.cssRules.length;
        stylesheet.insertRule(selector+"{"+rule+"}",index);
    }
}
function fix_e(e){
    if(!e&&window.event)
        e=window.event;
    if(!e.currentTarget&&e.srcElement)
        e.currentTarget=e.srcElement;
    if(!e.originalTarget&&e.srcElement)
        e.originalTarget=e.srcElement;
    return e;
}