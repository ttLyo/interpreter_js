var fs = require("fs")
var readlineSync = require('readline-sync');
var symbol_num = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
var symbol = ["(",")","[","]","{","}","+","-","*","/","<",">","=","<>","==",",",";","&"]
var key_word = ["int","float","if","else","while","true","false","break","continue","print","scanf"]
var key_word_num = [19,20,21,22,23,24,25,26,27,28,29]
var config = {
    c:true,
    g:true,
    r:true
}
function character(){
    var identify = []
    var result = []
    var dealing = ""
    var now_index=0
    var now_row=1
    var character = /[a-zA-Z]/
    var number = /[\d\.]/
    var id = /\w/
    function create_id(data){
        while(now_index<data.length){
            if(id.test(data[now_index])){
                dealing+=data[now_index]
                now_index++
            }
            else{
                if(key_word.includes(dealing)){
                    result.push({
                        key:dealing,
                        num:key_word_num[key_word.indexOf(dealing)] ,
                        row:now_row
                    })
                    dealing=""
                    return true
                }
                else{
                    if(data[now_index-1]=="_"){
                        console.log("error input! identify can not end with '_' at row:"+now_row)
                        break
                    }
                    else{
                        result.push({
                            key:dealing,
                            num:0.5,
                            row:now_row
                        })
                    }
                    dealing=""
                    return true
                }
            }
        }
        console.log("error input! the end of the code should be a symbol")
        return false
    }
    function create_symbol(data){
        // console.log(data[now_index])
        if(data[now_index]=="/"&&data[now_index+1]=="/"){
            pass_row(data);
            return true
        }
        if(data[now_index]=="/"&&data[now_index+1]=="*"){
            pass_rows(data);
            return true
        }
        dealing+=data[now_index]
        if(data[now_index]=="<"&&data[now_index+1]==">"){
            now_index++
            dealing+=data[now_index]
        }
        if(data[now_index]=="="&&data[now_index+1]=="="){
            now_index++
            dealing+=data[now_index]
        }
        // console.log(dealing)
        result.push({
            key:dealing,
            num:symbol_num[symbol.indexOf(dealing)],
            row:now_row
        })
        dealing=""
        now_index++
        return true
    }
    function create_number(data){
        while(now_index<data.length){
            let point_num=0
            for(let i of dealing){
                if(i==".")point_num++
            }
            if(point_num>1){
                console.log("error input! there are too many '.' at row:"+now_row)
                break
            }
            if(number.test(data[now_index])){
                dealing+=data[now_index]
                now_index++
            }
            else if(!character.test(data[now_index])&&data[now_index-1]!="."){
                result.push({
                    key:dealing,
                    num:-parseFloat(dealing),
                    row:now_row
                })
                dealing=""
                // now_index++
                return true
            }
            else{
                console.log("error input! number can not end with character or symbol at row:"+now_row)
                break
            }
        }
        console.log("error input! the end of the code should be a symbol")
        return false
    }
    function pass_row(data){
        while(true){
            if(data[now_index]=="\n"||typeof(data[now_index])=="undefined"){return}
            now_index++
            // console.log(now_index)
            // console.log(data[now_index])
        }
    }
    function pass_rows(data){
        while(true){
            if(data[now_index]=="\n"){
                now_row++
            }
            if((data[now_index]=="*"&&data[now_index+1]=="/")||typeof(data[now_index])=="undefined"){
                now_index+=2
                return
            }
            now_index++
        }
    }
    fs.readFile("code.txt",(err,data)=>{
        if(err){
            console.error(err)
        }
        data = data.toString().trim()//.replace(/\s+/,"")
        // console.log(data)
        while(now_index<data.length){
            if(character.test(data[now_index])){
                if(!create_id(data))return
            }
            else if(symbol.includes(data[now_index])){
                if(!create_symbol(data))return
            }
            else if(number.test(data[now_index])){
                if(!create_number(data))return
            }
            else{
                if(data[now_index]=="\n"){
                    now_row++
                }
                if(/\s/.test(data[now_index])){
                    now_index++
                }
                else{
                    console.log("error input "+data[now_index].key+" at row:"+now_row)
                    return
                }
            }
        }
        fs.writeFile("character.txt", JSON.stringify(result), (err)=>{
            if(err){
                console.log(err)
                return
            }
            // console.log("词法分析结束")
            console.log("--------------词法")
            if(config.c)console.log(result)
            grammer()
        })
        // console.log(result)
    })
}
    
function grammer(){
    var now_index = 0
    var have_err = false
    var my_data
    function parent(type,children){
        this.type = type
        this.children = children
        if(my_data[now_index]||my_data[now_index-1])
            this.row = my_data[now_index]?my_data[now_index].row:my_data[now_index-1].row
    }
    function end(type,value){
        this.type = type
        this.value = value
        if(my_data[now_index])
        this.row = my_data[now_index]?my_data[now_index].row:my_data[now_index-1].row
    }
    var result = []
    function error(err,data){
        try{
            if(have_err)return
            if(!data[now_index])now_index--
            console.log("error! at row"+data[now_index].row+": "+err+" error token: "+data[now_index].key)
            now_index= data.length
            have_err=true
        }
        catch(e){

        }
        
    }
    function number(data){
        let value = ""
        if(data[now_index])
            if(data[now_index].key=="+"||data[now_index].key=="-"){
                value+=data[now_index].key
                now_index++//吃掉+/-
            }
        if(data[now_index]&&data[now_index].num<0.5){
            value+=data[now_index].key
            now_index++//吃掉数字
            if(value.includes("."))
                return new end("float_constant",parseFloat(value))
            else
                return new end("int_constant",parseInt(value))
        }
        else{
            error("get number fail",data)
            return false
        }
    }
    function list(data){
        let temp_list = []
        while(data[now_index]&&data[now_index].key=='['){
            now_index++//吃掉[
            if(data[now_index].key==']'){
                error('there should be a number for the list',data)
                return false
            }
            let temp = relation(data)
            now_index++//吃掉]
            temp_list.push(temp)
        }
        // now_index++//吃掉[
        // let temp = relation(data)
        // now_index++//吃掉]
        // if(data[now_index]&&data[now_index].key=='['){
        //     return new parent('list',[temp,list(data)])
        // }
        return temp_list
    }
    function item(data){
        if(data[now_index]&&data[now_index].num==0.5){
            // now_sentence.push(data[now_index])
            now_index++
            let id = new end("variable",data[now_index-1].key)
            if(data[now_index]&&data[now_index].key=='['){
                return new parent("list",[id,list(data)])
            }
            else{
                return id
            }
        }
        else{
            let temp = number(data)
            if(temp){
                return temp
            }
        }
    }
    function suanshu(data){//括号
        if(data[now_index]&&data[now_index].key=="("){
            now_index++
            let temp = relation(data)
            if(data[now_index]&&data[now_index].key==")"){
                now_index++
                return temp
            }
            else{
                error(data[now_index.row,"need a ')'",data])
            }
        }
        else{
            return item(data)
        }
    }
    function mul_dil(data){
        let left = suanshu(data)
        let exp = _mul_dil(data,left)
        if(exp.length>1){
            return new parent("mul_dil",exp) 
        }
        return left
    }
    function _mul_dil(data,left){
        let temp = []
        let a = left
        while(data[now_index]&&(data[now_index].key=="*"||data[now_index].key=="/")){
            temp.push(new parent(data[now_index].key,[a]))
            now_index++//吃掉符号
            a = suanshu(data)
        }
        temp.push(new parent('end',[a]))
        return temp
    }
    function add_sub(data){
        let left = mul_dil(data)
        let exp = _add_sub(data,left)
        if(exp.length>1){
            return new parent("add_sub",exp) 
        }
        return left
    }
    function _add_sub(data,left){
        let temp = []
        let a = left
        while(data[now_index]&&(data[now_index].key=="+"||data[now_index].key=="-")){
            temp.push(new parent(data[now_index].key,[a]))
            now_index++//吃掉符号
            a = mul_dil(data)
        }
        temp.push(new parent('end',[a]))
        return temp
    }
    function relation(data){
        if(data[now_index]&&data[now_index].key=='{'){
            now_index++//吃掉{
            let temp = [relation(data)]
            while(data[now_index]&&data[now_index].key!='}'){
                if(data[now_index].key==','){
                    now_index++//吃掉，
                    temp.push(relation(data))
                }
                else{
                    error('there should be ,',data)
                    return false
                }
            }
            if(data[now_index].key=='}'){
                now_index++//吃掉}
                return new parent('relation_list',temp)
            }
            else{
                error('there should be }',data)
                return false
            }
        }
        if(data[now_index]&&data[now_index].key=='}'){
            return new end('null','')
        }
        let left = add_sub(data)
        let exp = _relation(data,left)
        if(exp.length>1){
            return new parent("relation",exp) 
        }
        return left
    }
    function _relation(data,left){
        let temp = []
        let a = left
        while(data[now_index]&&(
            data[now_index].key==">"
            ||data[now_index].key=="<"
            ||data[now_index].key=="="
            ||data[now_index].key=="=="
            ||data[now_index].key=="<>"
        )){
            temp.push(new parent(data[now_index].key,[a]))
            now_index++//吃掉符号
            a = add_sub(data)
        }
        temp.push(new parent('end',[a]))
        return temp
    }
    function sm(data){
        let true_type = data[now_index-1].key
        if(data[now_index]&&data[now_index].key=='['){//处理int[] float[]
            now_index++
            if(data[now_index]&&data[now_index].key==']'){
                now_index++
                true_type = true_type+"_list"
            }
            else{
                error('need a ]',data)
            }
                
        }
        if(data[now_index]&&data[now_index].num==0.5){
            let store = item(data)
            if(store.type=='list'){
                store.type = true_type+'_'+store.type
            }
            else{
                store.type = true_type
            }
            if(data[now_index]&&data[now_index].key==";"){
                now_index++//吃掉分号
                return store
            }
            else if(data[now_index]&&data[now_index].key=="="){
                now_index++//吃掉=号
                let temp = relation(data)
                if(data[now_index]&&data[now_index].key==";"){
                    now_index++//吃掉分号
                    return new parent("=",[store,temp])
                }
                else{
                    error("need a ;",data)
                }
            }
            else{
                error("identify can not be oprated before create",data)
            }
        }
        else{
            error("the identify should not be keyword,symbol or number",data)
        }
            
    }
    function equ(data){
        let temp = item(data)
        now_index++//吃掉=号
        return new parent("=",[temp,relation(data)])
    }
    function loop(data){
        if(data[now_index]&&data[now_index].key=="("){
            now_index++//吃掉(
            let temp = relation(data)
            if(data[now_index]&&data[now_index].key==")"){
                now_index++//吃掉)
                let body = sentence(data)
                return new parent("while",[temp,body])
            }
            else{
                error("need a ')'",data)
            }
        }
        else{
            error("need a '('",data)
        }
    }
    function choose(data){
        if(data[now_index]&&data[now_index].key=="("){
            now_index++//吃掉(
            let temp = relation(data)
            if(data[now_index]&&data[now_index].key==")"){
                now_index++//吃掉)
                let body = sentence(data)
                // if(data[now_index]&&data[now_index].key=="{"){
                //     now_index++//吃掉{
                //     while(data[now_index]&&data[now_index].key!="}"){
                //         body.push(sentence(data))
                //     }
                //     now_index++//吃掉}
                // }
                // else{
                //     body.push(sentence(data))
                // }    
                let if_sentence = new parent("if",[temp,body])//保存if语句块
                if(data[now_index]&&data[now_index].key=="else"){
                    return new parent("if-else",[if_sentence,else_choose(data)])
                }
                return if_sentence
            }
            else{
                error("need a ')'",data)
                return false
            }
        }
        else{
            error("need a '('",data)
            return false
        }
    }
    function else_choose(data){
        now_index++//吃掉else
        let body = sentence(data)
        // if(data[now_index]&&data[now_index].key=="{"){
        //     now_index++//吃掉{
        //     while(data[now_index]&&data[now_index].key!="}"){
        //         body.push(sentence(data))
        //     }
        //     if(data[now_index]&&data[now_index].key!="}"){
        //         now_index++//吃掉}
        //     }
        //     else{
        //         error('need a }',data)
        //     }
        // }
        // else{
        //     body.push(sentence(data))
        // }    
        return new parent("else",body)
    }
    function out(data){
        if(data[now_index]&&data[now_index].key=="("){
            now_index++//吃掉(
            let temp = relation(data)
            if(data[now_index]&&data[now_index].key==")"){
                now_index++//吃掉)
                if(data[now_index]&&data[now_index].key==";"){
                    now_index++//吃掉;
                    return new parent('print',temp)
                }
                else{
                    error("need a ';'",data)
                }
            }
            else{
                error("need a ')'",data)
            }
        }
        else{
            error("need a '('",data)
        }
    }
    function inn(data){
        if(data[now_index]&&data[now_index].key=="("){
            now_index++//吃掉(
            let temp = item(data)
            if(data[now_index]&&data[now_index].key==")"){
                now_index++//吃掉)
                if(data[now_index]&&data[now_index].key==";"){
                    now_index++//吃掉;
                    return new parent('scanf',temp)
                }
                else{
                    error("need a ';'",data)
                }
            }
            else{
                error("need a ')'",data)
            }
        }
        else{
            error("need a '('",data)
        }
    }
    function sentence(data){
        switch(data[now_index]&&data[now_index].num){
            case 19://int
                now_index++
                return sm(data)
            case 20://float
                now_index++
                return sm(data)
            case 23://while
                now_index++
                return loop(data)
            case 21://if
                now_index++
                return choose(data)
            case 28://print
                now_index++
                return out(data)
            case 29://scanf
                now_index++
                return inn(data)
            case 26://break
                now_index++
                if(data[now_index].key==';'){
                    now_index++
                    return new end('break','break')
                }
                error('need a ;',data)
            case 27://continue
                now_index++
                if(data[now_index].key==';'){
                    now_index++
                    return new end('continue','continue')
                }
                error('need a ;',data)
            case 17: //;
                now_index++
                return new end('null',';')
            case 5: //{
                now_index++ 
                let innner = []
                while(data[now_index]&&data[now_index].key!='}'){
                    innner.push(sentence(data))
                }
                if(data[now_index]&&data[now_index].key=='}'){
                    now_index++
                }
                else{
                    error('need a }',data)
                }
                return new parent('sentence_list',innner)
            case 0.5:
                let temp = equ(data)
                if(data[now_index]&&data[now_index].key==";"){
                    now_index++
                    return temp;
                }
                else{
                    error("need ';' ",data)
                }
                break
            default:
                error('this token can not start a sentence',data)
                
        }
    }
    fs.readFile("character.txt",(err,data)=>{
        if(err){
            console.error(err)
        }
        data = JSON.parse(data)
        my_data = data
        while(now_index<data.length&&!have_err){
            result.push(sentence(data))
        }
        if(!have_err)
        fs.writeFile("grammer.txt", JSON.stringify(result), (err)=>{
            if(err){
                console.log(err)
                return
            }
            console.log("--------------语法")
            if(config.g)console.log(JSON.stringify(result))
            run()
        })
    })
}

function run(){
    var id_stack = [{}]
    var have_err = false
    function identify(type,data=null){
        this.value = data
        this.type = type
    }
    function error(err,node){
        try{
            if(have_err)return
            console.log("error! at row"+node.row+": "+err)
            have_err=true
        }
        catch(e){
            
        }
    }
    function deal_sentence(node){
        if(have_err)return
        switch(node.type){
            case 'sentence_list':
                id_stack.unshift({})
                for(let i of node.children){
                   let res = deal_sentence(i)
                   if(res=='break')return 'break'
                   if(res=='continue')break
                }
                id_stack.shift()
                break
            case 'int':
                create_identify(node)
                break
            case 'float':
                create_identify(node)
                break
            case 'int_list':
                create_identify(node)
                break
            case 'float_list':
                create_identify(node)
                break
            case '=':
                set_identify(node)
                break
            case 'while':
                deal_loop(node)
                break
            case 'if':
                return deal_choose(node)
            case 'if-else':
                return deal_choose1(node)
            case 'continue':
                return 'continue'
            case 'break':
                return 'break'
            case 'print':
                deal_print(node)
                break
            case 'scanf':
                deal_scanf(node)
                break
            default:
                break
        }
    }
    function create_identify(node){
        if(have_err)return
        let type = {
            name:node.type
        }
        let name = node.value
        if(!name){//为数组
            name = node.children[0].value
            type.count = []
            for(let i of node.children[1]){
                if(i.type!='int_constant'){
                    error('you should state a list with a given constant size',node)
                    return false
                }
                type.count.push(i.value)
            }
            id_stack[0][name] = new identify(type,[])
        }
        else{
            id_stack[0][name] = new identify(type)
        }
        
    }
    function search_identify(id,node){
        if(have_err)return
        let level//作用域
        let flag = false//标识符是否存在
        for(level in id_stack){
            if(id_stack[level][id]){
                flag=true
                break
            }
        }
        if(!flag){
            error('you should state the identify <'+id+'> before using.',node)
            return -1
        }
        return level
    }
    function set_identify(node){
        if(have_err)return
        //若是声明语句  则新增标识符
        if(node.children[0].type!='variable'&&node.children[0].type!='list'){
            create_identify(node.children[0])
        }
        let id = node.children[0].value?
            node.children[0].value:
            node.children[0].children[0].value//标识符名

        //查标识符是否在标识符表
        let level = search_identify(id,node)//作用域
        if(level==-1)return false

        //类型检测  赋值
        if(id_stack[level][id].type.name=='int'){
            let value = analyse_exp(node.children[1])
            if(typeof(value)!='number'){
                error('you shold asign int with an int',node);
                return false
            }
            
            id_stack[level][id].value = value
        }
        else if(id_stack[level][id].type.name=='float'){//浮点数赋值
            if(node.children[1].type=='relation_list'){
                error('you shold asign float with a float',node);
                return false
            }
            id_stack[level][id].value = analyse_exp(node.children[1])
        }
        else if(node.children[0].type=='list'){//数组项赋值
            let index = get_list_index(level,id,node.children[0].children[1])
            if(id_stack[level][id].type.name=='int_list')
                id_stack[level][id].value[index] = parseInt(analyse_exp(node.children[1])) 
            if(id_stack[level][id].type.name=='float_list')
                id_stack[level][id].value[index] = analyse_exp(node.children[1])
        }
        else if(id_stack[level][id].type.name=='int_list'){//整型数组
            if(node.children[1].type!='relation_list'){
                error(('you can not asign list with a number',node));
                return false
            }
            let value = toInt(analyse_exp(node.children[1])) 
            id_stack[level][id].value = value
            if(!id_stack[level][id].type.count)
                id_stack[level][id].type.count = [value.length]
            let c = 0
            for(let i of id_stack[level][id].type.count){
                c+=i
            }
            if(c<value.length){
                error("the index of "+id+" is over",node)
            }
        }
        else if(id_stack[level][id].type.name=='float_list'){//浮点型数组
            if(node.children[1].type!='relation_list'){
                error(('you can not asign list with a number',node));
                return false
            }
            let value = analyse_exp(node.children[1])
            id_stack[level][id].value = value
            if(!id_stack[level][id].type.count)
                id_stack[level][id].type.count = [value.length]
            let c = 0
            for(let i of id_stack[level][id].type.count){
                c+=i
            }
            if(c<value.length){
                error("the index of "+id+" is over",node)
            }
        }
    }
    function toInt(list){
        if(have_err)return
        for(let i in list){
            if(typeof(list[i])!='object'){
                list[i] = parseInt(list[i])
            }
            else{
                list[i] = toInt(list[i])
            }
        }
        return list
    }
    function analyse_exp(node){
        if(have_err)return
        if(node.type=='int_constant'||node.type=='float_constant'){
            return node.value
        }
        if(node.type=='null'){
            return []
        }
        if(node.type=='variable'){
            return get_variable_value(node)
        }
        if(node.type=='list'){
            return get_list_value(node)
        }
        if(node.type=='relation'){
            return deal_relation(node)
        }
        if(node.type=='add_sub'){
            return deal_add_sub(node)
        }
        if(node.type=='mul_dil'){
            return deal_mul_dil(node)
        }
        if(node.type=='relation_list'){
            let result = []
            for(let i of node.children){
                result.push(analyse_exp(i))
            }
            return result
        }
        return analyse_exp(node.children[0])
    }
    function deal_relation(node){
        if(have_err)return
        let result = analyse_exp(node.children[0]) 
        for(let i=0;i<node.children.length;i++){
            switch(node.children[i].type){
                case '==':
                    result = result==analyse_exp(node.children[i+1])
                    break
                case '<>':
                    result = result!=analyse_exp(node.children[i+1])
                    break
                case '>':
                    result = result>analyse_exp(node.children[i+1])
                    break
                case '<':
                    result = result<analyse_exp(node.children[i+1])
                    break
                case 'end':
                    return result?1:0
                default:
                    error('unknow error',node)
            }
        }
    }
    function deal_add_sub(node){
        if(have_err)return
        if(node.type=='int_constant'||node.type=='float_constant'){
            return node.value
        }
        if(node.type=='variable'){
            return get_variable_value(node)
        }
        if(node.type=='list'){
            return get_list_value(node)
        }
        let result = analyse_exp(node.children[0]) 
        for(let i=0;i<node.children.length;i++){
            switch(node.children[i].type){
                case '+':
                    result+=analyse_exp(node.children[i+1])
                    break
                case '-':
                    result-=analyse_exp(node.children[i+1])
                    break
                case 'end':
                    return result
                default:
                    error('unknow error',node)
            }
        }
    }
    function deal_mul_dil(node){
        if(have_err)return
        if(node.type=='int_constant'||node.type=='float_constant'){
            return node.value
        }
        if(node.type=='variable'){
            return get_variable_value(node)
        }
        if(node.type=='list'){
            return get_list_value(node)
        }
        let result = analyse_exp(node.children[0]) 
        for(let i=0;i<node.children.length;i++){
            switch(node.children[i].type){
                case '*':
                    result*= analyse_exp(node.children[i+1]) 
                    break
                case '/':
                    let right = analyse_exp(node.children[i+1]) 
                    if(right==0){
                        error("/0 is illegal",node)
                        return false
                    }
                    result/=right
                    break
                case 'end':
                    return result
                default:
                    error('unknow error',node)
            }
        }
    }
    function get_variable_value(node){
        if(have_err)return
        let id = node.value
        let level = search_identify(id,node)//作用域
        if(level==-1)return false
        return id_stack[level][id].value
    }
    function get_list_index(level,id,node){
        if(have_err)return
        let index = 0
        //数组的维数
        let s_num = id_stack[level][id].type.count?id_stack[level][id].type.count.length:0
        let ccc = Math.max(s_num,node.length)
        for(let i=ccc-1;i>=0;i--){
            if(!node[i]||!id_stack[level][id].type.count[i]
                ){
                error('the index of the list is illegal',node[0])
                return false
            }
            let value = analyse_exp(node[i]) 
            if(id_stack[level][id].type.count[i]<= value){
                error('the index of the list is illegal',node[0])
                return false
            }
            // if(i<ccc)
            //     index += id_stack[level][id].type.count[i-1]*analyse_exp(node[i-1]) 
            let temp = value
            for(let j=i;j<ccc;j++){
                temp *= 
                (id_stack[level][id].type.count[j+1] ? id_stack[level][id].type.count[j+1] : 1)
                
            }
                // console.log(value,temp)
            index+=temp
        }
        if(isNaN(index)){
            error('your ask for the list item is illegal',node[0])
            return false
        }
        return parseInt(index) 
    }
    function get_list_value(node){
        if(have_err)return
        let id = node.children[0].value
        let level = search_identify(id,node)
        let index = get_list_index(level,id,node.children[1])
        if(level==-1)return false
        return id_stack[level][id].value[index]
    }
    function deal_loop(node){
        if(have_err)return
        let exp = analyse_exp(node.children[0])
        let max = 150000000
        while(exp&&max>0){
            let iii = deal_sentence(node.children[1])
            if(iii=='break')break
            exp = analyse_exp(node.children[0])
            max--
        }
    }
    function deal_choose(node){
        if(have_err)return
        let exp = analyse_exp(node.children[0])
        if(exp){
            return deal_sentence(node.children[1])//返回break continue用
        }
        return ''
    }
    function deal_choose1(node){
        if(have_err)return
        let if_res = deal_sentence(node.children[0])
        if(if_res==''){
           return deal_sentence(node.children[1].children)
        }
        return ''
    }
    function deal_print(node){
        if(have_err)return
        console.log(analyse_exp(node.children))
    }
    function deal_scanf(node){
        if(have_err)return
        node = node.children
        if(node.type=='list'){
            let id = node.children[0].value
            let level = search_identify(id,node)
            let index = get_list_index(level,id,node.children[1])
            id_stack[level][id].value[index] = parseFloat(readlineSync.question()) 
        }
        else if(node.type=='variable'){
            let id = node.value
            let level = search_identify(id,node)
            let type = id_stack[level][id].type.name
            if(type=='int_list'||type=="float_list"){
                let input = readlineSync.question().split(' ')
                for(let i in input){
                    if(type=='int_list')input[i] = parseInt(input[i])
                    else input[i] = parseFloat()
                }
                id_stack[level][id].value = input
            }
            else
                id_stack[level][id].value = parseFloat(readlineSync.question()) 
        }
        else{
            error("you can not set value for a number",node)
        }

    }
    fs.readFile("grammer.txt",(err,data)=>{
        if(err){
            console.error(err)
        }
        data = JSON.parse(data)
        my_data = data
        // console.log(data)
        for(let i of data){
            deal_sentence(i)
        }
        console.log("--------------符号表")
        if(config.r&&!have_err)console.log(JSON.stringify(id_stack))
    })
}
let para = process.argv.slice(2)
if(para.length>0){
    config.c = para[0]!='0'?true:false
    config.g = para[1]!='0'?true:false
    config.r = para[2]!='0'?true:false
}

character()