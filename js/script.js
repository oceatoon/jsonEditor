
var tree = {
	activeObj : null,
	activeElem : {"id":null,"lvl":null,"el":null},
	/*
	 * These params are filled during the nvaigation process
	 * contain navigation history and persistent access points 
	 */
	navMap : [],//is a 2 dimensional array corresponding to x,y = the position in the data and values the corresponding node 
	navKeys : [],
	navBreadcrumb : [], // is a list of the clicked elements
	navKeyBreadcrumb : [],
	/***************
	* on click opens the clicked node if it has children (array or object type)
	* either launches the reading process 
	* or if allready open colapses all open nodes
	*/
	openObject : function(){
		log('openObject openeing tree.activeElem.lvl :'+tree.activeElem.lvl+', elem:'+tree.activeElem.el);
		if(typeof tree.navMap[tree.activeElem.lvl][tree.activeElem.el] == 'object' ){
			isAleradyOpen = tree.navBreadcrumb.in_array('#element_'+tree.activeElem.lvl+'_');
			log("isAleradyOpen : "+typeof isAleradyOpen+" value :"+isAleradyOpen);
			readAnyway = true;
			if( isAleradyOpen !== false )
			{
				//close all children of this elem
				$( tree.navBreadcrumb[isAleradyOpen] ).removeClass('selected');
				tmp = [];
				tmpK = [];
				log(tree.navBreadcrumb);
				if(tree.navBreadcrumb[isAleradyOpen] == '#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el)
					readAnyway = false;
				$.each(tree.navBreadcrumb, function(i)
				{
					if(i >= isAleradyOpen)
						$("#panel"+(i+1)).detach();
					else 
					{
						tmp.push(tree.navBreadcrumb[i]);
						tmpK.push(tree.navKeyBreadcrumb[i]);
					}
				});
				tree.navBreadcrumb = tmp;
				tree.navKeyBreadcrumb = tmpK;
				log(tree.navBreadcrumb);
			}
			if(readAnyway)
			{
				//adds a red border to leave a breadcrumb of navigation
				$('#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el).addClass('selected');
				tree.navBreadcrumb.push('#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el);
				tree.navKeyBreadcrumb.push(tree.navKeys[tree.activeElem.lvl][tree.activeElem.el]);
				log('navKeys');
				log(tree.navKeys,'info');
				log('navBreadcrumb');
				log(tree.navBreadcrumb,'info');
				log('navKeyBreadcrumb');
				log(tree.navKeyBreadcrumb,'info');
				tree.readContent( tree.navMap[tree.activeElem.lvl][tree.activeElem.el] , tree.activeElem.lvl+1, tree.activeElem.el );
				
			}
		}
	},
	/***************
	* parses the the obj param 
	* renders according to type array , object, simple value node
	*/
	readContent : function (obj,lvl,el){
		if(tree.validateJson(obj)){
			log('readContent openeing lvl :'+lvl+', elem:'+el+', length:'+obj.length);
			tree.activeObj = obj;
			
			//prepare HTML object container
			if($("#objRoot"+lvl).length == 0)
				$("#container").append('<div id="panel'+lvl+'" class="treePanel" ><ul id="objRoot'+lvl+'"></ul></div>');
			//empty it's content if allready full 
			if($("#objRoot"+lvl+" li").length > 0)
				$("#objRoot"+lvl).html('');
				
			if(tree.navMap[lvl]==undefined)
			{
				tree.navMap[lvl] = [];
				tree.navKeys[lvl] = [];
			}
			
			//according to type parse ojbect and build htlm elemnts of content
			ct = 0;
			if( typeof obj == "object" && obj.length != undefined )
			{
				//the object is an array
				$.each(obj, function(i)
				{
					tree.navMap[lvl][i] = obj[i];
					tree.navKeys[lvl][i] = i+'_array_pos';
					if( typeof obj[i] == "object" && obj[i].length != undefined ) 
					{
						$("#objRoot"+lvl).append('<li id="element_'+(lvl)+'_'+i+'" class="treeElem"><a href="javascript:tree.openObject() ">'+obj[i].length+' element array <b>+</b></a></li>');
					} else if( typeof obj[i] == "object" ) 
					{
						$("#objRoot"+lvl).append('<li id="element_'+(lvl)+'_'+i+'" class="treeElem"><a href="javascript:tree.openObject() ">'+getLength(obj[i])+' element object <b>+</b></a></li>');
					} else
						$("#objRoot"+lvl).append('<li id="element_'+(lvl)+'_'+i+'" class="treeElem">'+obj[i]+'</li>');
					ct++;
				});
			}
			else if(typeof obj == "object"){
				//the object is a json object
				$.each(obj, function(key, val){
					tree.navMap[lvl][ct] = val;
					tree.navKeys[lvl][ct] = key;
					
					keyT = key.split("_-_");
					lblKey = ( keyT[1]!=null ) ? keyT[0] : key ;
					
					if(keyT[1]!='callback'){
						if( typeof val == "object" ) 
							if(keyT[1]=='tpl')
							{	
								log(val,'dir');
								if(keyT[2]=='url')
									$("#objRoot"+lvl).append('<li id="element_'+lvl+'_'+ct+'" class="treeElem"> <a href="http://'+val['url_-_text']+'" target="_blank">'+val['url_-_text']+'</a></li>');
							}else
								$("#objRoot"+lvl).append('<li id="element_'+lvl+'_'+ct+'" class="treeElem"><a href="javascript:tree.openObject()">'+lblKey+' <b>+</b></a></li>');
						else 
							$("#objRoot"+lvl).append('<li id="element_'+lvl+'_'+ct+'" class="treeElem">'+lblKey+' : '+val+'</li>');
					}
					ct++;
				});
			}
			else 
				alert("unrecognised content type");
			
			if(ct > 0){
				//add edit block to the panel 
				$("#toolsContainer").detach();
				panelTools = tree.getPanelTools(obj,lvl,el);
				$("#containerTools").append(panelTools);
				styleButtons();
				$('.treeElem').click( function(event){ tree.activateElement(this);});
				$(".treeElem").keyup(function(event) 
				{
					   var code = (event.keyCode ? event.keyCode : event.which);
					   moveOn = false;
					   step = 1;
					  //if (event.shiftKey && event.keyCode == 9)step = -1; , Bugs pops up 3 event which breaks the process
					   
					   if ( code == 9) 
					   {
						 log("EVENT : treeElem editing > tab pressed","warn");
						 moveOn = true;
					   }
					   if(moveOn){
						 event.preventDefault();
					     tree.editElement(lvl ,el ,true);
					     //hitting tab key, opens the next sibling for editing
					     elPos = tree.activeElem.el+step;
				    	 log('editing sibling node #element_'+tree.activeElem.lvl+'_'+elPos);
				    	 if($('#element_'+tree.activeElem.lvl+'_'+elPos ).length > 0)
				    	 {
					    	 $('#element_'+tree.activeElem.lvl+'_'+elPos ).trigger("click");
					    	 
						     if(typeof tree.navMap[tree.activeElem.lvl][elPos] == 'object')
						    	 tree.readContent(tree.navMap[tree.activeElem.lvl][elPos],lvl+1,el);
						     else
						    	 tree.editElement(lvl ,elPos ,false);
				    	 }
					   }
					});
			}
		} else
			alert("malformed or empty Json Object!");
	},
	/**
	 * each node of the tree can be designed based on node type 
	 * creates the HTMl of the node 
	 * and add's to node HTMl to the DOM the parent HTML container objRoot+lvl
	 */
	nodeRenderHtml : function(key,val,lvl,ct){
		log("nodeRenderHtml > key : "+key+" - val : "+val+" - lvl : "+lvl+" - ct : "+ct);
		keyT = key.split("_-_");
		lblKey = ( keyT[1]!=null ) ? keyT[0] : key ;
		
		if(keyT[1]=='callback')
			return ct;//callbacks have nothing to render
		
		if( typeof val == "object" ) 
			/*if(keyT[1]=='url')
				$("#objRoot"+lvl).append('<li id="element_'+lvl+'_'+ct+'" class="treeElem"><a href="'+val.url+'">'+val.label+'</a></li>');
			else
				*/$("#objRoot"+lvl).append('<li id="element_'+lvl+'_'+ct+'" class="treeElem"><a href="javascript:tree.openObject()">'+lblKey+' <b>+</b></a></li>');
		else 
			$("#objRoot"+lvl).append('<li id="element_'+lvl+'_'+ct+'" class="treeElem">'+lblKey+' : '+val+'</li>');
		
		return ct++;
		
	},
	/**
	 * Element becomes active when clicked
	 */
	activateElement : function(el){
		$('.activeElem').removeClass('activeElem')
		tree.activeElem = el;
		id = tree.activeElem.id;
		log('EVENT : activateElement > '+id,"warn");
		idT = id.split("_");
		tree.activeElem.lvl = Number(idT[1]);
		
		tree.activeElem.el = Number(idT[2]);
		$(el).addClass('activeElem');
	},
	getPanelTools : function(obj,lvl,el){
		
		panelTools = "<div id='toolsContainer'>";
		if(lvl == 0)
			parentKey = tree.navKeys[lvl][el];
		else
			parentKey = tree.navKeys[lvl-1][el];
		log("getPanelTools : "+lvl+" , "+el+" , "+parentKey);
		parentKeyT = parentKey.split("_-_"); 
		if(obj.length == undefined && parentKeyT[1]=='tpl'){
			log("getPanelTools : "+lvl+" , "+el+" , "+parentKey);
			panelTools += "<ul class='tools'>"+
								"<li><a href='javascript:;' onclick='tree.addTemplateElement(\""+parentKeyT[2]+"\","+lvl+","+el+",false);' class='btnplus'>Add</a> "+
								 "<a href='javascript:;' onclick='tree.editElement("+lvl+","+el+",false);' class='btnpencil'>Edit</a> "+
								 "<a href='javascript:' onclick='tree.deleteNode("+lvl+","+el+");' class='btntrash'>Delete</a></li>"+
								 "</ul><span>Node Type : "+parentKeyT[2]+"</span>";
		}else if(obj.length == undefined && parentKeyT[1]=='tpl_popinForm'){
			log("getPanelTools : "+lvl+" , "+el+" , "+parentKey);
			panelTools += "<ul class='tools'>"+
								"<li><a href='javascript:;' onclick='tree.popinTemplateForm(\""+parentKeyT[2]+"\","+lvl+","+el+",false);' class='btnplus'>Add</a> "+
								 "<a href='javascript:;' onclick='tree.editElement("+lvl+","+el+",false);' class='btnpencil'>Edit</a> "+
								 "<a href='javascript:' onclick='tree.deleteNode("+lvl+","+el+");' class='btntrash'>Delete</a></li>"+
								 "</ul><span>Node Type : "+parentKeyT[2]+"</span>";
		}else{
			panelTools += "<ul class='tools'>"+
								"<li><a href='javascript:;' onclick='$(\"#containerTools .toolsAdd\").slideToggle()' class='btnplus'>Add</a> "+
								 "<a href='javascript:;' onclick='tree.editElement("+lvl+","+el+",false);' class='btnpencil'>Edit</a> "+
								 "<a href='javascript:' onclick='tree.deleteNode("+lvl+","+el+");' class='btntrash'>Delete</a></li>"+
								 "</ul>"+
						   "<ul class='toolsAdd hidden'>"+
								"<li><a href='javascript:;' onclick='tree.addSimpleElement("+lvl+","+el+",false);' class='btn'>Element</a> "+
								 "<a href='javascript:tree.addArrayElement("+lvl+","+el+");' class='btn'>Array</a> "+
								 "<a href='javascript:tree.addObjectElement("+lvl+","+el+");' class='btn'>Object</a></li>"+
						    "</ul>";
		}
		panelTools += "</div>";
		return panelTools;
			
	},
	/***************
	 * Empties all the visible blocks
	 * intialises  tree.navKeyBreadcrumb,tree.navBreadcrumb,tree.navMap,tree.navKeys
	 * TODO:should infact reaload the source json cleaning up any residual changes
	 */
	resetView : function()
	{
		tree.navMap = [];
		tree.navKeys = [];
		tree.navBreadcrumb = [];
		tree.navKeyBreadcrumb = [];
	
		//empty existing panels
		$('.treePanel').detach();
		
		//find the selected node in the initial tree
		activeNode = dataObj;
		tree.readContent(activeNode,0,0);
	},
	/**
	 * used to reset the initial value of a node 
	 * essentially used when canceling an edit action
	 */
	resetNode: function(){
		id = tree.activeElem.id;
		$("#"+id).removeClass('edited');
		key = tree.navKeys[tree.activeElem.lvl][tree.activeElem.el];
		keyT = key.split('_-_');
		key = keyT[0];
		$("#"+id).html(( key.indexOf('_array_pos') >= 0 ) ? tree.navMap[tree.activeElem.lvl][tree.activeElem.el] 
														  : key+" : "+tree.navMap[tree.activeElem.lvl][tree.activeElem.el]);
	},
	/***************
	 * Empties all the visible blocks
	 * Runs through  tree.navKeyBreadcrumb and tree.readContents again
	 */
	reloadView : function()
	{
		activeNode = dataObj;
		//empty existing panels
		$('.treePanel').detach();
		
		
		//find the selected node in the initial tree
		activeNode = dataObj;
		tree.readContent(activeNode,0,0);
		$.each(tree.navKeyBreadcrumb, function(i){
			key = tree.navKeyBreadcrumb[i];
			keyT = key.split("_");
			$(tree.navBreadcrumb[i]).addClass('selected');
			log("reloadView > "+key);
			activeNode = ( key.indexOf('_array_pos') >= 0 ) ? activeNode[Number(keyT[0])] : activeNode[key];
			tree.readContent( activeNode ,i+1,0);
		});
	},
	reloadNode : function(lvl,el)
	{
		if(lvl == 0 && el == 0)
			tree.readContent(dataObj,0,0);
		else 
			tree.readContent( tree.navMap[lvl-1][el] , lvl, el );
	},
	/***************
	 * Edits a simple element in an array or an object
	 * only edits an existant node
	 */
	editElement : function(lvl,el,save)
	{
		log('editElement > lvl :'+lvl+" - el : "+el+", save:"+save);
		if(tree.activeElem.lvl != null){
			id = tree.activeElem.id;
			elementLvl = tree.activeElem.lvl;
			elementPosition = tree.activeElem.el;
			log('editElement > elementLvl :'+elementLvl+" - elementPosition : "+elementPosition);
			log('editElement > key :'+tree.navKeys[elementLvl][elementPosition]+" - val : "+tree.navMap[elementLvl][elementPosition]);
			
			//clicking edit on an object type node opens it and activates editing on the first child (can be recursive)
			if( typeof tree.navMap[elementLvl][elementPosition] == 'object' )
			{
				tree.openObject();
				elementLvl++;
				elementPosition = 0;
				$('#element_'+elementLvl+'_'+elementPosition).trigger('click');
			    tree.editElement(tree.activeElem.lvl ,tree.activeElem.el ,false); 
			}else
			{
				//popinDialog.openAjax('popupAddElement','views/simpleElement.html','addSimpleElement','ADD A SIMPLE ELEMENT',null);
				//$('#dialogContainer').dialog('open');
				if(save){
					if(typeof tree.navMap[elementLvl][elementPosition] != 'object')
					{
						activeNode = tree.getNodeParentNode();

						//change in the initial dataObj's value
						key = tree.navKeys[elementLvl][elementPosition];
						//request a new value
						inputkey = ( key != null ) ? tree.navKeys[elementLvl][elementPosition] : 'nodeValue' ;
						value = ( key.indexOf("_-_") > 0 ) ? document.getElementById(key).value : $("#"+key).val();
						log('editElement > element saving '+key+' input id ='+inputkey+', value ='+value ,'info');
						keyT = key.split("_");
						activeNode[ ( key.indexOf('_array_pos') >= 0 ) ? Number(keyT[0]) : key ] = value;
						$("#"+id).removeClass('edited');
						
						tree.reloadView();
					} else
						alert("you are trying to edit an object (NOT SUPPORTED YET).");
				}else{
					$("#"+id).addClass('edited');
					inputkey = ( tree.navKeys[elementLvl][elementPosition] != null ) ? tree.navKeys[elementLvl][elementPosition] : 'nodeValue' ;
					
					inputStr = tree.buildInputHtml(inputkey,tree.navMap[elementLvl][elementPosition]);
					btnHTML = inputStr +
							  '<a id="savebutton" class="btnsave" href="javascript:;" onclick="tree.editElement('+lvl+' ,'+el+' ,true);"> SAVE </a>'+
							  '<a id="closebutton" class="btnclose" href="javascript:tree.resetNode('+tree.activeElem.lvl+' ,'+tree.activeElem.el+')"> CANCEL </a>';
					$("#"+id).html(btnHTML);
					$("textarea[name='"+inputkey+"']").focus();
					$("a.btnsave ").button({ icons: {secondary:'ui-icon-disk'} }  );
					$("a.btnclose ").button({ icons: {secondary:'ui-icon-closethick'} }  );
					$("#"+inputkey).keyup(function(event) 
					{
					   event.preventDefault();
					   var code = (event.keyCode ? event.keyCode : event.which);
					   if ( code == 13) 
					   {
					     log("EVENT : "+inputkey+" editing > enter || tab pressed","warn");
					     tree.editElement(lvl ,el ,true);						     
					   }
					});
				}
			}
		} else
			alert("you must select a node to edit.");
	},
	/***************
	 * Will add a simple element key value 
	 */
	addSimpleElement : function(lvl,el,save)
	{
		log("addSimpleElement : "+save);
		if(save)
		{
			value = $('#nodeValue').val();
			if(tree.activeObj.length != undefined)
				tree.activeObj.push(value);
			else
			{
				key = $('#nodekey').val();
				tree.activeObj[key] = value;
			}
			popinDialog.close();
			tree.reloadView();
		}
		else
		{
			if(tree.activeObj.length != undefined)
				popinDialog.openAjax('popupAddElement','views/simpleElement.php?type=array&lvl='+lvl+'&el='+el,'addSimpleElement','ADD A SIMPLE ELEMENT',null);
			else
				popinDialog.openAjax('popupAddElement','views/simpleElement.php?type=object&lvl='+lvl+'&el='+el,'addSimpleElement','ADD A SIMPLE ELEMENT',null);
		}
	},
	/***************
	 * 
	 */
	addArrayElement : function(lvl,el)
	{
		firstElement = prompt('firstElement');
		
		if(tree.activeObj.length != undefined)
			tree.activeObj.push([firstElement]);
		else
		{
			key = prompt('array Name');
			tree.activeObj[key] = [firstElement];
		}
		tree.reloadView();
		
	},
	/***************
	 * 
	 */
	addObjectElement : function(lvl,el)
	{
		firstkey = prompt('first key');
		firstvalue = prompt('first value');		
		if(tree.activeObj.length != undefined)
		{
			obj = {};
			obj[firstkey] = firstvalue;
			tree.activeObj.push(obj);
		}else
		{
			key = prompt('object Name');
			tree.activeObj[key] = {};
			tree.activeObj[key][firstkey] = firstvalue;
		}
		tree.reloadView(); 
	},
	/**
	 * builds a prebuild node based on a source template  
	 */
	addTemplateElement : function(template,lvl,el,save){
		key = prompt(template+' Name');
		value = null;
		 $.ajax({
		      url: 'forms/'+template+'.js',
		      dataType: 'json',
		      success: function(data) {
		    	  if(data){
		    		  //alert('template data found');
			    	  tree.activeObj[key] = data;
			    	  tree.reloadView();
		    	  }else
		    		  alert("error getting the template");
		  	  }
		  	});
		 
	},
	/**
	 * opens a Form in a popin based on a Json description of the form 
	 * also saves is save == true from a form into the dataObj
	 */
	popinTemplateForm : function(template,lvl,el,save,childFormKey)
	{
		log('popinTemplateForm > '+template+' > childFormKey :'+childFormKey);
		htmlStr = '<h3>This describes your '+template+'</h3>';
		$.ajax({
		      url: 'forms/'+template+'.js?date='+new Date(),
		      dataType: 'json',
		      success: function(data) 
		      {
		    	  if(data){
		    		  if(save)
		    		  {
		    			  if(childFormKey != null && childFormKey != undefined && childFormKey != 'undefined'){
		    				  log('popinTemplateForm > '+template+' > saving child form :'+childFormKey,'info');
		    				  //child Forms for Sub Objects are saved as strings in hidden inputs to be evaled in the final process 
		    				  valueStr = JSONstringify(tree.saveTemplateForm(data));
		    				  if( childFormKey.indexOf('_-_')>0 ) 
		    					  document.getElementById(childFormKey).value = valueStr;
		    				  else
		    					  $('#'+childFormKey).val( valueStr);
					    	  popinDialog.close();
					    	  //TODO : deal in depth callbacks
		    			  }else{
		    				  log('popinTemplateForm > saving tpl :'+template,'info');
			    			  tree.activeObj[$('#'+template+'Name').val()] = tree.saveTemplateForm( data );
					    	  tree.reloadView();
					    	  popinDialog.close();
					    	  //callback function will have to be defined externaly and eval'ed from the json template , 
					    	  //due to a json limitation when load by ajax json function cannot be used
					    	  if(data['save_-_callback'])
					    		  eval(data['save_-_callback']);
		    			  }
		    		  } else
		    		  {
		    			  htmlStr += tree.buildTemplateForm(data,template,lvl,el,childFormKey);
			    		  params = {'id' : 'popinTemplateForm',
				    				'html' : htmlStr,
				    				'prefix' : 'popinTemplateForm',
				    				'title' : 'PLEASE FILL THE FORM',
				    				'callback' : null };
			    		  if(childFormKey)
			    			  params['2ndPopin'] = true;
			    		  popinDialog.openFillHtml(params);
			    		  $("a.btnsave ").button({ icons: {secondary:'ui-icon-disk'} }  );
						  $("a.btnclose ").button({ icons: {secondary:'ui-icon-closethick'} }  );
						  $("a.btnplus ").button({ icons: {secondary:'ui-icon-plusthick'} }  );	
		    		  }
		    	  }else
		    		  alert("error getting the template");
		  	  }
		  	});
	},
	/**
	 * builds a form based on a json description of the form
	 * keys of the description json can contain type arguments 
	 * ex : toto_-_checkbox
	 * 		toto_-_textarea
	 * default will be text
	 */
	buildTemplateForm : function(jsonForm,template,lvl,el,childFormKey)
	{
		html = (!childFormKey) ? '<label>'+template +' Name</label><input type="text" id="'+template+'Name" val="" />' : '';
		$.each(jsonForm, function(key, val)
		{
				html += tree.buildInputHtml(key,val);
		});
		if(html != '')
		{
			html += '<br/><br/><a id="savebutton" class="btnsave" href="javascript:;" onclick="tree.popinTemplateForm(\''+template+'\' ,'+lvl+' ,'+el+' ,true,\''+childFormKey+'\');"> SAVE </a>'+
			  		'<a id="closebutton" class="btnclose" href="javascript:popinDialog.close()"> CANCEL </a>'
		}
		log('buildTemplateForm :'+html);
		return html;
	},
	buildInputHtml : function(key,val,lvl,el)
	{
		log('buildInputHtml :'+key+" :: "+val);
		keyT = key.split('_-_');
		html = '<br/><label>'+keyT[0] +'</label>';
		type = (keyT[1] != null) ? keyT[1] : 'textarea';
		//list of all available input types
		if(type == "callback")
			html = '';
		else if(type == "tpl")
			html += "<a href='javascript:;' onclick='tree.popinTemplateForm(\""+keyT[2]+"\","+(lvl+1)+","+el+",false,\""+key+"\");' class='btnplus'>Add</a>"+
					//"<textarea id='"+key+"'></textarea>";
					"<input type='hidden' id='"+key+"'/>";
		else if(type == 'textarea')
			html += '<textarea id="'+key+'">'+val+'</textarea>';
		else if(type == 'datepicker')
			html += '<input type="text" id="'+key+'"  value="'+val+'">'+
					'<script>$( "#'+key+'" ).datepicker();</script>';
		else
			html += '<input type="'+type+'" id="'+key+'" value="'+val+'" />';
		return html;
	},
	/**
	 * after opening a template form this process saves it
	 */
	saveTemplateForm : function(jsonForm)
	{
		log(jsonForm,'dir');
		$.each(jsonForm, function(key, val)
				{
			keyT = key.split('_-_');
			if(keyT[1] != "callback")
			{
				//there seems to be a bug with '|' caracters in Jquery selectors
				value = ( keyT[1] != null ) ? document.getElementById(key).value : $("#"+key).val();
				log("saveTemplateForm >"+key+" : "+typeof value);
				//child Objects are saved as strings to be evaled 
				jsonForm[key] = ( keyT[1] == 'tpl' && typeof $.parseJSON(value) == 'object' ) ? $.parseJSON(value) : value;
				
			}
		});
		log(jsonForm,'dir');
		return jsonForm;
	},
	/***************/
	deleteNode : function()
	{
		log('deleteNode > lvl :'+tree.activeElem.lvl+" - el : "+tree.activeElem.el);
		if(tree.activeElem != null){
			
			activeNode = tree.getNodeParentNode();
			key = tree.navKeys[tree.activeElem.lvl][tree.activeElem.el];
			if( key.indexOf('_array_pos') >= 0 ){
				keyT = key.split("_");
				pos = Number(keyT[0]);
				activeNode.splice(pos, 1);
			} else
				delete activeNode[ key ];
			
			if(Number(tree.activeElem.lvl) > tree.activeElem.lvl)
				tree.reloadView();
			else
			{
				if(tree.activeElem.lvl == 0 && tree.activeElem.el == 0)
					tree.readContent(dataObj,0,0);
				else 
					tree.readContent( activeNode , tree.activeElem.lvl, 0 );
			}
		} else
			alert("you must select a node to edit.");
	},
	/**
	 * find the selected node's parent in the initial tree absed on the key breadcrumb
	 */
	getNodeParentNode : function (){
		activeNode = dataObj;
		$.each(tree.navKeyBreadcrumb, function(i)
		{
			if(i < tree.activeElem.lvl){
				key = tree.navKeyBreadcrumb[i];
				keyT = key.split("_");
				activeNode = ( key.indexOf('_array_pos') >= 0 ) ? activeNode[Number(key[0])] : activeNode[key];
			}
		});
		return activeNode;
	},
	/***************
	 * Stringifies the DataObj and dumps into a textarea
	 * TODO : cleaner way would be to through it as a flie to be upload through php
	 */
	exportJson : function(){
		popinDialog.openAjax('popupExport','views/export.html','exportJson','YOUR JSON EXPORTED HERE',function(){$('#exportedJSON').val(JSONstringify(dataObj))});
	},
	/***************/
	loadJson : function(parse){
		if(parse)
		{
			try{
				//dataObj = $.parseJSON($('#importJSON').val());
				eval("dataObj = "+$('#importJSON').val());
				tree.resetView();
				popinDialog.close();
			} catch(e){
				alert("this is malformed, try it through Jsonlint ");
			}
		} else
			popinDialog.openAjax('popupLoad','views/loadJson.html','loadJson','COPY / PASTE OR UPLOAD',null);
	},
	/***************/
	validateJson : function(obj){
		if(obj != null)
			return true;
		else
			return false;
	}
};

$(document).ready(function()
{
	tree.resetView();
	styleButtons();
	$("a.btnfolder ").button({ icons: {secondary:'ui-icon-folder-open'} }  );
	$("a.btnreset ").button({ icons: {secondary:'ui-icon-refresh'} }  );
	$("a.btnreload ").button({ icons: {secondary:'ui-icon-arrowrefresh-1-s'} }  );
	$("a.btnexport ").button({ icons: {secondary:'ui-icon-disk'} }  );
	$("#filterInfo").buttonset();
	$('#testsBtn').click( function(event){event.preventDefault();$('.info').slideUp();$('#tests').slideToggle();});
	$('#featuresBtn').click( function(event){event.preventDefault();$('.info').slideUp();$('#features').slideToggle();});
	$('#philosophyBtn').click( function(event){event.preventDefault();$('.info').slideUp();$('#philosophy').slideToggle();});
	$('#wishlistBtn').click( function(event){event.preventDefault();$('.info').slideUp();$('#wishlist').slideToggle();});
	$('#thxBtn').click( function(event){event.preventDefault();$('.info').slideUp();$('#thx').slideToggle();});
	initKeyNavigation();
	
	/*jQuery('#accordion').accordion({ 
	    header: '.head', 
	    navigation: true,
	    animated: 'easeslide',
	    active: false,
	})*/
});
function initKeyNavigation(){
	$(document.documentElement).keyup(function (event) {
		
	  // handle cursor keys
		if ( (tree.activeElem == null || !$("#"+tree.activeElem.id).hasClass("edited")) 
			&& (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40)  ) 
		{
		  log('EVENT : initNav > press key'+event.keyCode);
		  event.preventDefault();	
		  if (event.keyCode == 37) 
		  {
			  log('EVENT : initNav > pressing left',"warn");
			  if( tree.activeElem.lvl == null && tree.activeElem.el == null && $('#element_0_0').length > 0 )
			  {
				  tree.activeElem.lvl = 1;
				  tree.activeElem.el = 0;
			  }
			  log('initNav > go left '+tree.activeElem.lvl+" - "+tree.activeElem.el);
			  if($('#element_'+(tree.activeElem.lvl-1)+'_0').length > 0 )
			  {
				  tree.activeElem.lvl--;
				  $('#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el).trigger('click');
			  } else 
				  tree.openObject();
			  
		  } else if (event.keyCode == 39) 
		  {
			  log('EVENT : initNav > pressing right',"warn");
			  if( tree.activeElem.lvl == null && tree.activeElem.el == null && $('#element_0_0').length > 0 )
			  {
				  tree.activeElem.lvl = 0;
				  tree.activeElem.el = 0;
			  }
			  log('initNav > go right '+tree.activeElem.lvl+" - "+tree.activeElem.el);
			  justOpenedNode = false;
			  //when a Node is a parent node it opens it
			  if (tree.navBreadcrumb[tree.activeElem.lvl] != '#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el || $('#element_'+(tree.activeElem.lvl+1)+'_0').length <= 0 )
			  {
				  tree.openObject();
				  justOpenedNode = true;
			  }//else makes it editable
			  
			  if(tree.navBreadcrumb[tree.activeElem.lvl] == '#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el && $('#element_'+(tree.activeElem.lvl+1)+'_0').length > 0 )
			  {
				  tree.activeElem.lvl++;
				  if(justOpenedNode)
					  tree.activeElem.el = 0;
				  $('#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el).trigger('click');
			  }else
				  tree.editElement(tree.activeElem.lvl ,tree.activeElem.el ,false); 
		  }
		  else if (event.keyCode == 40) 
		  {
			  log('EVENT : initNav > pressing down '+tree.activeElem.lvl+" - "+tree.activeElem.el,"warn");
			  if( tree.activeElem.lvl == null && tree.activeElem.el == null && $('#element_0_0').length > 0 )
			  {
				  tree.activeElem.lvl = 0;
				  tree.activeElem.el = -1;
			  }
			  log('initNav > go down '+tree.activeElem.lvl+" - "+tree.activeElem.el);
			  if($('#element_'+tree.activeElem.lvl+'_'+(tree.activeElem.el+1)).length > 0 )
			  {
				  tree.activeElem.el++;
				  $('#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el).trigger('click');
			  }
		  }
		  else if (event.keyCode == 38) 
		  {
			  log('EVENT : initNav > pressing up key',"warn");
			  if( tree.activeElem.lvl == null && tree.activeElem.el == null && $('#element_0_0').length > 0)
			  {
				  tree.activeElem.lvl = 0;
				  tree.activeElem.el = 1;
			  }
			  if($('#element_'+tree.activeElem.lvl+'_'+(tree.activeElem.el-1)).length > 0 )
			  {
				  tree.activeElem.el--;
				  $('#element_'+tree.activeElem.lvl+'_'+tree.activeElem.el).trigger('click');
			  }
		  }	  
		}
	});
}
function styleButtons(){
	$("a.btn ").button();
	$("a.btntrash ").button({ icons: {secondary:'ui-icon-trash'} }  );
	$("a.btnpencil ").button({ icons: {secondary:'ui-icon-pencil'} }  );
	$("a.btnplus ").button({ icons: {secondary:'ui-icon-plusthick'} }  );	
}
/********************************************************************************/
	//DEBUGGING
function log(msg,type)
{
    try {
    if(type)
    {
      switch(type)
      {
        case 'info': console.info(msg); break;
        case 'warn': console.warn(msg); break;
        case 'debug': console.debug(msg); break;
        case 'error': console.error(msg); break;
        case 'dir': console.dir(msg); break;
        default : console.log(msg);
      }
    } else
          console.log(msg);
  } catch (e) { 
     //alert(msg);
  }
}
		//JSON TOOLS
function getLength(obj) 
{
    var count = 0,key;
    for (key in obj) 
        if (obj.hasOwnProperty(key)) 
            count++;
        
    return count;
}
/**
 * Turns an object into a string
 */
function JSONstringify(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

		//DATE TOOLS
function nowDate()
{
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	return month + "/" + day + "/" + year;
}
		//Dialog Popin
var popinDialog = {
	open : null,
	id : 'dialogContainer',
	options : 
	{
        'modal':true,
        'autoOpen' : false,
        'width':'auto',
        'height':'auto'
        /*'buttons':{ 'Save' : function() { comment.save(function(){alert("coment saved")}); },
                    'Cancel' : function() { $(this).dialog("close") } }*/
    },
  /* ------------ */  
  openAjaxGet : function (paramsObj)
  {
  	//log('openAjaxDialogGet');
	//console.dir(paramsObj);
    $.ajax({
      url: paramsObj.url,
      success: function(data) {
  		// Start dialog
    	id = (paramsObj['2ndPopin']) ? 'dialogContainer2' : popinDialog.id;
    	$('#'+id).html(data);
    	popinDialog.options.title = paramsObj.title;
    	
        var $dialog = $('#'+id).dialog(popinDialog.options);
        $dialog.dialog('open'); 	
        popinDialog[id] = $dialog; 
        if(paramsObj.callback!= null && typeof(paramsObj.callback) == "function" )
        	paramsObj.callback();
  	  }
  	});
  	return false;
  },
  close : function(id)
  {
	  id = (!id && $('#dialogContainer2').html()!= '' && $('#dialogContainer2').html()!= '&nbsp;') ? 'dialogContainer2' :popinDialog.id;
	  popinDialog[id ].dialog('close'); 	
	  $('#'+id).html('');
  },
 /* ------------ */  
  openAjax : function (id,url,prefix,title,callback)
  {
	  popinDialog.openAjaxGet({'id':id,'url':url,'prefix':prefix,'title':title,'callback':callback});
  },
  /* ------------ */  
  openFillHtml : function (paramsObj)
  {
	  id = (paramsObj['2ndPopin']) ? 'dialogContainer2' : popinDialog.id;
	  $('#'+id).html(paramsObj.html);
	  popinDialog.options.title = paramsObj.title;
	  var $dialog = $('#'+id).dialog(popinDialog.options);
      $dialog.dialog('open'); 	
      popinDialog[id] = $dialog; 
      if(paramsObj.callback!= null && typeof(paramsObj.callback) == "function" )
      	paramsObj.callback();
  }
  
};

Array.prototype.in_array = function(el)
{
	//log(a+", search :"+el);
	res = false;
	a = this;
	$.each(a, function(i){
		//log(el+" == "+a[i]+" : "+(el == a[i]));
		if(!res && a[i].indexOf(el)>=0)
			res = i;
	});
	return res;
}
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.notContain = function(tab) {
	res = false;
	str = this;
	$.each(tab, function(i){
		//log(el+" == "+a[i]+" : "+(el == a[i]));
		if(!res && str.indexOf(tab[i])>=0)
			res = i;
	});
	return res;
}
function saveCallback(){
	alert("saveCallback() > do something with you data post Json save");
}