// import '@/api/zoomchart/assets/zc.css'
// import zoomCharts from '@/api/zoomchart/zoomcharts'
import { show_message } from '@/utils/message'

let defaultOption = {
    openStack:false
}

export class Pchart {
    constructor(params) {
        this.option = {...defaultOption,...params}
        this.memory = { stack:[],index:-1};
        this.initChart();
    }

    initChart(){
        console.log(this.option)
        this.chart = new NetChart(this.option);
    }

    on(){
        
    }

    /*
     * 添加数据
     */
    addData({nodes=[],links=[]}){
        //图中已经有的数据
        let oldData = this.exportData(),
            oldNodeIds = [],
            oldLinkIds = [],
            newNode = [],
            newLink = [];
        //已经存在的点、线id
        for(let[index,item] of oldData.nodes.entries()){
            oldNodeIds.push(item.id);
        }
        for(let[index,item] of oldData.links.entries()){
            oldLinkIds.push(item.id);
        }
        //过滤已有的数据
        newNode = nodes.filter((e)=>{
            if(!oldNodeIds.includes(e.id)){
                oldNodeIds.push(e.id);
                return true;
            }else{
                return false;
            }
        });

        newLink = links.filter((e)=>(!oldLinkIds.includes(e.id) && oldNodeIds.includes(e.from) && oldNodeIds.includes(e.to)));
        this.chart.addData({nodes:newNode,links:newLink})
        if(this.option.openStack){
            this.inStack({nodes:newNode,links:newLink,type:'add'});
        }
    }

    inStack(data){
        let stack = this.memory.stack;
        if(stack.length>this.memory.index){
            stack.splice(this.memory.index+1);
        }
        this.memory.stack.push(data);
        this.memory.index++;
        console.log(this.memory)
    }

    clearStack(){
        this.memory.stack = [];
        this.memory.index = -1;
        console.log(this.memory)
    }

    getPrevStack(){
        return this.memory.stack[this.memory.index--];
    }

    getNextStack(){
        return this.memory.stack[++this.memory.index];
    }

    undo(){
        if(this.option.openStack && this.memory.index>=0){
            let data = this.getPrevStack(),
                d = {nodes:data.nodes,links:data.links};
            switch (data.type){
                case 'add':
                    this.stackRemove(d);
                    break;
                case 'remove':
                    this.stackAdd(d);
                    break;
            }
        }else{
            console.log('no more');
            show_message('没有更多操作！', 'warning');
        }
    }

    redo(){
        if(this.option.openStack && this.memory.index<(this.memory.stack.length-1)){
            let data = this.getNextStack(),
                d = {nodes:data.nodes,links:data.links};
            switch (data.type){
                case 'add':
                    this.stackAdd(d);
                    break;
                case 'remove':
                    this.stackRemove(d);
                    break;
            }
        }else{
            console.log('no more')
            show_message('没有更多操作！', 'warning');
        }
    }

    stackAdd(data){
        this.chart.addData(data)
    }

    stackRemove(data){
        this.chart.removeData(data);
    }

    exportData(visibleOnly,exportCoordinates){
        return this.chart.exportData(visibleOnly,exportCoordinates);
    }

    getNode(id){
        return this.chart.getNode(id);
    }

    setNodeData(id,key,value){
        let data = this.getNode(id).data;
        if(arguments[1] instanceof Object){
            for(let k in key){
                data[k] = key[k];
            }
            
        }else{
            data[key] = value;
        }
        this.chart.updateStyle();
    }

    updateStyle(){
        this.chart.updateStyle();
    }

    replaceData(data){
        this.chart.replaceData(data);
        this.clearStack();
        this.inStack({...data,type:'add'});
    }

    remove(){
        this.chart.remove();
        if(this.option.openStack){
            this.clearStack();
        }
    }

    selection(arr){
        this.chart.selection(arr);
    }

    getSelection(){
        return this.chart.selection();
    }

    paintNow(){
        this.chart.paintNow();
    }

    resetLayout(){
        this.chart.resetLayout();
    }

    removeData(data){
        this.chart.removeData(data);
        if(this.option.openStack){
            let d = {nodes:[],links:[]},
                linkIds = [];
            if(data.links){
                for(let [i,link] of data.links.entries()){
                    linkIds.push(link.id);
                    d.links.push({...(this.getLink(link.id).data)})
                }
            }
            if(data.nodes){
                for(let [i,node] of data.nodes.entries()){
                    let nodeItem = this.getNode(node.id);
                    console.log(nodeItem)
                    d.nodes.push({...(nodeItem.data)});
                    for(let[index,link] of nodeItem.dataLinks.entries()){
                        if(!linkIds.includes(link.id)){
                            d.links.push({...link});
                            linkIds.push(link.id);
                        }
                    }
                }
            }
            
            this.inStack({...d,type:'remove'});
        }
    }

    removeDataFull(data){
        this.chart.removeData(data);
        this.inStack({...data,type:'remove'});
    }

    getNode(id){
        return this.chart.getNode(id);
    }

    getLink(id){ 
        return this.chart.getLink(id);
    }

    clear(){
        this.remove();
        this.option.data.preloaded = [];
        this.initChart();
    }

    back(){
        this.chart.back();
    }

    updateSize(){
        this.chart.updateSize();
    }

    getNodeDimensions(id){
        return this.chart.getNodeDimensions(id);
    }

    scrollIntoView(nodes,margins){
        this.chart.scrollIntoView(nodes,margins);
    }

    updateFilters(){
        this.chart.updateFilters()
    }

    updateSettings(config){
        this.chart.updateSettings(config);
    }

    zoom(params){
        this.chart.zoom(params);
    }

    resumePaint(){
        this.chart.resumePaint();
    }
}