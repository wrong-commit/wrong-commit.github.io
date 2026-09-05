/* shrinks repo based off the repo='' attribute */
function toggleRepo(e){
    var repo = e.getAttribute('repo');
    var par = document.getElementById(repo).parentElement;
    if(par.getAttribute('clicked')){
        e.innerHTML = 'expanding..';
        par.removeAttribute('clicked'); //update text of button
        par.classList.remove('collapsed')
        par.classList.add('opened')
        setTimeout(function(){
            e.innerHTML = 'click to shrink';
        },500);
    }else{
        par.setAttribute('clicked','yedo.s');
        e.innerHTML = 'shrinking...';
        par.classList.remove('opened')
        par.classList.add('collapsed')
        setTimeout(function(){
            e.innerHTML = 'click to expand';            
        },500);
    }
}
/**
 * Loads the JSON file representing a Git directory. 
 * @param {String} repoName repository slug 
 * @param {String} id id to use to update HTML elements
 * @param {String} displayBoxID ID of element to populate code of
 */
function downloadRepo(repoName,id,displayBoxID) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        console.log("Downloading repo " + repoName);
        var root = JSON.parse(xhr.response).root;
        var repo = document.getElementById(id);
        console.log('dlRepo - displayBoxID:'+displayBoxID);
        buildDir(root,repo,displayBoxID,repoName);
    }
    xhr.open('GET', '/repo/'+repoName+".json", true);
    xhr.send();
}

function displayDocument(repo,dir,item,target){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
        console.log('target:' +target);
        document.getElementById(target).innerHTML = xhr.response;
    }
    xhr.open('GET', '/document/'+repo+dir+'/'+item, true);
    xhr.send();
}

function buildDir(tree,parent,displayBoxID,repoName){
    console.log('id:'+displayBoxID);
    for(var i=0; i < tree.length; i++){
        var msg='[*] Created node ';
        var item;
        var node = tree[i];
        if( node.type == "file" ){
            msg+= 'type:name';
            item = document.createElement('li');
            item.innerHTML = node.name;
            item.classList.add('doc_test');
            item.classList.add('text');
            item.setAttribute('repo',repoName);
            console.log('repo:'+repoName);
            item.setAttribute('path',node.parent);
            item.setAttribute('name',node.name);
            item.addEventListener( 'click',function(e){
                if( this==e.target ){
                    var chosen = this.parentNode.querySelectorAll('.selected_document');
                    if( chosen != null && chosen.length > 0){
                        chosen.forEach(c => c.classList.remove('selected_document'))
                    }
                    this.classList.add('selected_document');
                    displayDocument(this.getAttribute('repo'), this.getAttribute('path'), this.getAttribute('name'), displayBoxID);
                }
            } );
            //download and display readme by default
            if(node.name == 'README.md'){
                item.classList.add('selected_document');
                displayDocument(item.getAttribute('repo'), item.getAttribute('path'), item.getAttribute('name'), displayBoxID);
            }
        }
        if( node.type == "dir" ){
            msg+= 'type:directory';
            item = document.createElement('ul');
            item.classList.add('dir_closed');
            var child = document.createElement('span');
            child.innerHTML = node.name;
            child.classList.add('text');
            child.addEventListener( 'click',function(e){
                if( this==e.target ){
                    if( this.parentElement.classList.contains('dir_closed') ){
                        this.parentElement.classList.remove('dir_closed');
                        this.parentElement.classList.add('dir_open');
                    }else{
                        this.parentElement.classList.remove('dir_open');
                        this.parentElement.classList.add('dir_closed');
                    }
                }
            } );
            item.appendChild(child);
            buildDir(node.children,item,displayBoxID,repoName);
        }
        console.log(msg);
        parent.appendChild(item);
    }
}