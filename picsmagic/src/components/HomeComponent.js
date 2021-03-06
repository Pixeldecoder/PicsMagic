import React, { Component, useCallback} from "react";
import ImageEditor from "@toast-ui/react-image-editor";
import {TabContent, TabPane,Nav, NavItem, NavLink,Button,Modal,ModalHeader,ModalBody,ModalFooter,Card,CardBody,CardTitle} from "reactstrap";
import Basics from "./BasicsComponent";
import Filter from "./FilterComponent";
import Crop from "./CropComponent";
import Draw from "./DrawComponent";
import Text from "./TextComponent";
import Mask from "./MaskComponent";
import Sticker from "./StickerComponent";
import classnames from 'classnames';
const icona = require("tui-image-editor/dist/svg/icon-a.svg");
const iconb = require("tui-image-editor/dist/svg/icon-b.svg");
const iconc = require("tui-image-editor/dist/svg/icon-c.svg");
const icond = require("tui-image-editor/dist/svg/icon-d.svg");
const download = require("downloadjs");
/*const myTheme = {
  "common.backgroundColor": "#151515",
  "downloadButton.backgroundColor": "white",
  "downloadButton.borderColor": "white",
  "downloadButton.color": "black",
  "menu.normalIcon.path": icond,
  "menu.activeIcon.path": iconb,
  "menu.disabledIcon.path": icona,
  "menu.hoverIcon.path": iconc,
};*/
function hexToRGBa(hex, alpha) {
    if(hex===null){return null;}
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var a = alpha || 1;
    if (isNaN(r) || isNaN(g) || isNaN(b)) {return null;}

    return {r:r, g:g, b:b, a:a};
}
function getRGBaValues(rgb){
    var colorsOnly = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/);
    return {r:colorsOnly[0], g:colorsOnly[1], b:colorsOnly[2], a:colorsOnly[3]}
}

class Home extends Component {
  constructor(props){
    super(props);
    this.state={
        curMode:"normal",
        isModalOpen:false,
        imageSelected:this.props.imageSelected,
        imageLib : this.props.imageLib,
        curId:this.props.curId,
        activeTab:'1',
        drawColor:{
            r: '241',
            g: '112',
            b: '19',
            a: '1'
        },
        drawRange: { x: 5},
        textColor:{
            r: '255',
            g: '187',
            b: '59',
            a: '1'
        },
        textRange: { x: 50},
        bold:false,
        italic:false,
        underline:false,
        selectedId: 0,
    }
    this.saveImageToDisk = this.saveImageToDisk.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.confirmModal = this.confirmModal.bind(this);
    this.checkhighlight = this.checkhighlight.bind(this);
    this.uploadHandleClick = this.uploadHandleClick.bind(this);
    this.uploadHandleChange = this.uploadHandleChange.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
  }
  //Create editor instance reference
  imageEditor = React.createRef();
  //handle upload functions
  hiddenFileInput = React.createRef();

  toggleModal(){
      this.setState({
        isModalOpen :!this.state.isModalOpen
      });
  }
  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  confirmModal(){
    const editorInstance = this.imageEditor.current.getInstance();
    editorInstance.loadImageFromURL(this.props.imageSelected.name,"image");
    this.props.changeImageSelected(this.state.imageSelected);
    this.props.changeImageLib(this.state.imageLib);
    this.props.changeCurId(this.state.curId);
    this.toggleModal();
    }
  
  //Saving method. Will be used later
  saveImageToDisk (){
    const imageEditorInst = this.imageEditor.current.imageEditorInst;
    const data = imageEditorInst.toDataURL();
    if (data) {
      const mimeType = data.split(";")[0];
      const extension = data.split(";")[0].split("/")[1];
      download(data, `image.${extension}`, mimeType);
    }
  };
  componentDidMount(){
    this.imageEditor.current.getRootElement().children[0].classList.add('d-none');
    this.imageEditor.current.getRootElement().children[1].children[0].classList.add('d-none');
    this.imageEditor.current.getRootElement().children[1].children[1].children[0].classList.add('d-none');
  }
  //check highlighted picture in upload 
  checkhighlight(img){
    const check = this.state.imageSelected.id===img.id? "highlight":"";
    return check;
  }
  
  /* Programatically click the hidden file input element
   when the Button component is clicked*/
  uploadHandleClick (){
    this.hiddenFileInput.current.click();
  };
  /*Call a function (passed as a prop from the parent component)
   to handle the user-selected file */
  uploadHandleChange (event) {
      const files = event.target.files;
      var fileList=[];
      var id = this.state.curId;
      for(var i =0; i<files.length;i++){
        const fileUploaded = URL.createObjectURL(files[i]);
        const newImage = {
            name: fileUploaded,
            id: id+1
        }
        id+=1;
        fileList.push(newImage);
      }
      this.setState({
        curId:id,
        imageLib: this.state.imageLib.concat(fileList)
    });
  };
//Return back to the Nomal mode befor all features
stopDrawingMode(){
    const editorInstance = this.imageEditor.current.getInstance();
    editorInstance.stopDrawingMode();
  }

//Handle the sleection event when an object is selected
handleSelection(props){
    //console.log(props);
    if(props.type==='i-text'){
        this.setState({selectedId:props.id});
        this.setState({textRange:{x:parseInt(props.fontSize, 10)}});
        this.setState({textColor: (hexToRGBa(props.fill,1)===null)?getRGBaValues(props.fill):hexToRGBa(props.fill,1)});
        if(props.fontWeight==='bold'){
            this.setState({bold:true});
        }else{
            this.setState({bold:false});
        }
        if(props.fontStyle==='italic'){
            this.setState({italic:true});
        }else{
            this.setState({italic:false});
        }
        if(props.textDecoration==='underline'){
            this.setState({underline:true});
        }else{
            this.setState({underline:false});
        }
        this.setState({curMode:props.textAlign});
    }
}

//Handle Drawing features
startDrawMode(){
    const editorInstance = this.imageEditor.current.getInstance();
    editorInstance.deactivateAll();
    this.handleDraw('free')
}
  handleDraw(mode){
    const editorInstance = this.imageEditor.current.getInstance();
    const settings= {
        width: this.state.drawRange.x,
        color: `rgba(${ this.state.drawColor.r }, ${ this.state.drawColor.g }, ${ this.state.drawColor.b }, ${ this.state.drawColor.a })`
    }
    if(mode==="free"){
        if(editorInstance.getDrawingMode()==="FREE_DRAWING"){
            editorInstance.stopDrawingMode();
        }else{
            editorInstance.startDrawingMode('FREE_DRAWING',settings);
            this.setState({curMode:"freedraw"})
        }
    }else if(mode==="line"){
        if(editorInstance.getDrawingMode()==="LINE_DRAWING"){
            editorInstance.stopDrawingMode();
        }else{
            editorInstance.startDrawingMode('LINE_DRAWING',settings);
            this.setState({curMode:"straightdraw"})
        }
    }else{
        editorInstance.stopDrawingMode();
        this.setState({curMode:"edit"})
    }
  }
  handleDrawColor(color){
      this.setState({drawColor:color});
      const editorInstance = this.imageEditor.current.getInstance();
      const settings= {
        width: this.state.drawRange.x,
        color: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`
    }
      if(editorInstance.getDrawingMode()==='LINE_DRAWING'){
        editorInstance.stopDrawingMode();
        editorInstance.startDrawingMode('LINE_DRAWING',settings);
        return;
      }
      editorInstance.setBrush({color: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`})
  }
  handleDrawRange(range){
      this.setState({drawRange: range});
      const editorInstance = this.imageEditor.current.getInstance();
      const settings= {
        width: range.x,
        color: `rgba(${ this.state.drawColor.r }, ${ this.state.drawColor.g }, ${ this.state.drawColor.b }, ${ this.state.drawColor.a })`
    }
      if(editorInstance.getDrawingMode()==='LINE_DRAWING'){
        editorInstance.stopDrawingMode();
        editorInstance.startDrawingMode('LINE_DRAWING',settings);
        return;
      }
      editorInstance.setBrush({width: range.x});
  }
//Handle Text Features
startTextMode(){
    const editorInstance = this.imageEditor.current.getInstance();
    editorInstance.deactivateAll();
    if(editorInstance.getDrawingMode()==='TEXT'){
        editorInstance.stopDrawingMode();
    }else{
        editorInstance.startDrawingMode('TEXT');
    }
}
addText(){
    const editorInstance = this.imageEditor.current.getInstance();
    editorInstance.deactivateAll();
    const settings= {
        styles:{
            fontSize: 50,
            fill: `rgba(${ this.state.textColor.r }, ${ this.state.textColor.g }, ${ this.state.textColor.b }, ${ this.state.textColor.a })`
        },
        position: {
            x:350,
            y: 200
        }
    }
    editorInstance.addText('Double Click',settings);

}
handleText(mode){
    const editorInstance = this.imageEditor.current.getInstance();
    var styleObj;
    switch (mode) {
        case 'b':
            styleObj = {fontWeight: 'bold'};
            this.setState({bold:!this.state.bold});
            break;
        case 'i':
            styleObj = {fontStyle: 'italic'};
            this.setState({italic:!this.state.italic});
            break;
        case 'u':
            styleObj = {textDecoration: 'underline'};
            this.setState({underline:!this.state.underline});
            break;
        case 'l':
            styleObj = {textAlign: 'left'};
            this.setState({curMode:'left'});
            break;
        case 'c':
            styleObj = {textAlign: 'center'};
            this.setState({curMode:'center'});
            break;
        case 'r':
            styleObj = {textAlign: 'right'};
            this.setState({curMode:'right'});
            break;
        default:
            styleObj = {};
    }
    editorInstance.changeTextStyle(this.state.selectedId,styleObj);
  }
handleTextColor(color){
    this.setState({textColor:color});
    const editorInstance = this.imageEditor.current.getInstance();
    editorInstance.changeTextStyle(this.state.selectedId,{
        'fill': `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`
    });
}
handleTextRange(range){
    this.setState({textRange: range});
    const editorInstance = this.imageEditor.current.getInstance();
    editorInstance.changeTextStyle(this.state.selectedId,{
        fontSize: parseInt(range.x, 10)
    });
}

  render(){
    const imgLibrary= this.state.imageLib.map((image)=>{
        return(
            <div key={image.id} className="col-lg-4 col-6">
                <img alt={image.name} 
                className={"img-thumbnail " + this.checkhighlight(image)}
                onClick={()=>this.setState({imageSelected:image})}
                src={image.name} />
            </div>
            );
        });
    return (
        <div className="row row-content">
            <div className="col-md-8 col-12  order-md-1 canvas">
                <div className="row">
                    <div className=" col-md-10">
                        <ImageEditor 
                        ref={this.imageEditor}
                        includeUI={{
                            loadImage: {
                            path: this.state.imageSelected.name,
                            name: "image",
                            },
                            //theme: myTheme,
                            uiSize: {
                                height: '500px',
                                width: '900px'
                            }
                        }} 
                        cssMaxHeight={460}
                        cssMaxWidth={700}
                        selectionStyle={{
                            cornerSize: 15,
                            cornerStyle:"circle",
                            cornerColor:"white",
                            rotatingPointOffset: 70,
                        }}
                        onObjectActivated={(props)=>this.handleSelection(props)}
                        />
                    </div>
                </div>
            </div>
            {/* This column is for the left sub task*/}
            <div className="col-md-3 col-12 order-md-0">
                <div className="row">
                    <div className="col-md-4 col-12 justify-content-center">
                        <Nav tabs vertical pills>
                            <NavItem onClick={()=>this.stopDrawingMode()}>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '1'})}
                                    onClick={() => {
                                    this.toggleTab('1');
                                    }}
                                >
                                    Basics
                                </NavLink>
                            </NavItem>
                            <NavItem onClick={()=>this.stopDrawingMode()}>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '2'})}
                                    onClick={() => {
                                    this.toggleTab('2');
                                    }}
                                >
                                    Filter
                                </NavLink>
                            </NavItem>
                            <NavItem onClick={()=>this.stopDrawingMode()}>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '3'})}
                                    onClick={() => {
                                    this.toggleTab('3');
                                    }}
                                >
                                    Crop
                                </NavLink>
                            </NavItem>
                            <NavItem onClick={()=>this.startDrawMode()}>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '4'})}
                                    onClick={() => {
                                    this.toggleTab('4');
                                    }}
                                >
                                    Draw
                                </NavLink>
                            </NavItem>
                            <NavItem onClick={()=>this.stopDrawingMode()}>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '5'})}
                                    onClick={() => {
                                    this.toggleTab('5');
                                    }}
                                >
                                    Sticker
                                </NavLink>
                            </NavItem>
                            <NavItem onClick={()=>this.startTextMode()}>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '6'})}
                                    onClick={() => {
                                    this.toggleTab('6');
                                    }}
                                >
                                    Text
                                </NavLink>
                            </NavItem>
                            <NavItem onClick={()=>this.stopDrawingMode()}>
                                <NavLink
                                    className={classnames({active: this.state.activeTab === '7'})}
                                    onClick={() => {
                                    this.toggleTab('7');
                                    }}
                                >
                                    Mask
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </div>
                    <div className="col-md-8 col-12 justify-content-center">
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                            {/*<Basics handleFlip={()=>this.handleFlip()} /> */}
                            </TabPane>
                            <TabPane tabId="2">
                            {/*<Basics handleFlip={()=>this.handleFlip()} /> */}
                            </TabPane>
                            <TabPane tabId="3">
                            {/*<Basics handleFlip={()=>this.handleFlip()} /> */}
                            </TabPane>
                            <TabPane tabId="4" >
                            <Draw 
                            color={this.state.drawColor} 
                            changeColor={(color)=>this.handleDrawColor(color)}
                            range={this.state.drawRange}
                            changeRange={(range)=>this.handleDrawRange(range)}
                            handleDraw={(mode)=>this.handleDraw(mode)}
                            curMode={this.state.curMode}/>
                            </TabPane>
                            <TabPane tabId="5">
                            {/*<Basics handleFlip={()=>this.handleFlip()} /> */}
                            </TabPane>
                            <TabPane tabId="6">
                            <Text 
                            color={this.state.textColor} 
                            changeColor={(color)=>this.handleTextColor(color)}
                            range={this.state.textRange}
                            changeRange={(range)=>this.handleTextRange(range)}
                            handleText={(mode)=>this.handleText(mode)}
                            curMode={this.state.curMode}
                            bold={this.state.bold}
                            italic={this.state.italic}
                            underline={this.state.underline}
                            addText={()=>this.addText()}
                            />
                            </TabPane>
                            <TabPane tabId="7">
                            {/*<Basics handleFlip={()=>this.handleFlip()} /> */}
                            </TabPane>
                        </TabContent>
                    </div>
                </div>
            
            </div> 
            {/* This column is for the Output button and upload on the right */}
            <div className="col-md-1 col-12 order-md-2 ">
                <div className="row justify-content-center">
                    <Button className="btn-outline-primary top left" onClick={this.toggleModal}>Load</Button>{' '}
                    <Modal className="modal-lg" isOpen={this.state.isModalOpen} toggle={this.toggleModal}>
                            <ModalHeader toggle={this.toggleModal}>Select a Picture</ModalHeader>
                            <ModalBody>
                                <div className="row">
                                    <div key="0"className="col-lg-4 col-6 mb-1">
                                        <Card>
                                            <CardBody className="text-center"> 
                                                <CardTitle alt="Upload"
                                                onClick={this.uploadHandleClick}
                                                ><i className="fa fa-3x fa-upload"></i><br/>
                                                <a href="#">Upload</a> 
                                                </CardTitle>
                                            </CardBody>
                                        </Card>
                                        <input type="file" multiple accept="image/*" id="input-image-file" 
                                        ref={this.hiddenFileInput}
                                        onChange={this.uploadHandleChange}
                                        style={{display: 'none'}} 
                                        />
                                    </div>
                                    {imgLibrary}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                            <Button color="primary" onClick={this.confirmModal}>Confirm</Button>{' '}
                            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        <Button className="btn-outline-secondary top mr" onClick={this.toggleModal}>Download</Button>{' '}
                </div>
            </div>
        </div>
    );
    }
}
export default Home;