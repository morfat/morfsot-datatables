
//acting after loading jquery ,bootstrap datatbles,notify js, toastr js,and bootstrap js files


function MorfsotTable(json_url,columns,column_identifier='id',orderable_column=0){
	var self=this;
	
	 self.buttons=null;
	 self.table=null;
	 self.column_identifier=column_identifier;
	 self.action=null; //the action of clicked button
	 self.selected_row_id=null; //identifier of selected row . this will depend on column_identifier set
	 self.selected_row_data=null;
	 

	 self.table_class='.datatable';
	 self.create_edit_modal_id='#create_edit_modal_id';
	 self.delete_modal_id="#delete_modal_id";
	 
	
	 self.buttons_div='.buttons';
	 self.search_div='.morfsot-datatables-search';
	 
	 self.create_edit_form_class='.morfsot_create_edit_form';
	 self.delete_form_class='.morfsot_delete_form';
	 
	 self.form=null;
	 self.form_progress_div='.form_progress_div';
	 
	 //define urls for service
	 self.ajax_url=json_url; //url for getting all records from server
	 self.create_url=null;
	 self.edit_url=null;
	 self.delete_url=null;
	 
	 //pagination variables
	 self.pagination_div='.morfsot-datatables-pagination';
	 self.pagination=null; //contains pagination info... expects previus,next and  total pages
	 

	//initialize table and create buttons
	//returns DataTable
	   var col_objs=[];
	   //create column objects array
	   for (i=0; i<columns.length; i++){
	   	col_objs.push({'data':columns[i]});
	   }
	   
       var table=$(self.table_class).DataTable({
        "paging":false,
        //"ordering":false,
        "filter":false,
        "processing":true,
        "language":{
        	 "loadingRecords": "Loading data ... ",
             "processing":     '<p  style="color:green;"><strong><i class="fa fa-circle-o-notch fa-spin fa-2x"></i>\
                                   Processing ... Please wait ... </p></strong></div>',
        },
        "info":false,
        "scrollX":true, //enable horizontal scrolling for large data
        "ajax":self.ajax_url,  //url that returns json
        //columns for disllay in <td>
        "columns":col_objs,
        rowId:self.column_identifier, //for identifying the rwo.this id value must be in returned json
        //"deferRender":true, //make table <tr> to be created as needed .
       /*selection */
       
        select: {
            style:    'single', //restrict to single row selection
            },
       
       order: [[ orderable_column, 'asc' ]], //ordering
       dom: 'Bfrtip',
       buttons: ['excel','print','csv','pdf']
        //buttons: ['excel','print','pdf','csv','selectAll','selectNone']
       });
       
       
       //extend table with buttons and other functions
       
       //add new button 
table.button().add( 0, {
    action: function ( e, dt, button, config ) {
      //
      //alert("create new ");
        //dt.ajax.reload();
        //$(self.create_edit_modal_id).modal('show'); //to display modal and allow user to implement save handling
        
        //$('#test').modal({show:true,});
       self.action='new';
       
       self.display_create_edit_form(); //make sure it comes after assigning action
        
    },
    text: 'New',
    className:'morfsot_buttons_new'
} );
//add edit button
table.button().add( 1, {
    action: function ( e, dt, button, config ) {
      
      var dit_row=dt.row( { selected: true } ).data();
      
      //var row=dt.row( { selected: true } );
      //alert(dt.row( { selected: true } ).id());
      //alert(dit_row);
     
    // console.log(dit_row);
     
     self.action='edit';
     
     self.display_create_edit_form(dit_row); //make sure it comes after assigning action
     
      //row.row().node().remove();
      //row.row().remove
      //table.draw();
        //dt.ajax.reload();
    },
    text: 'Edit',
    className:'morfsot_buttons_edit'
} );


//add delete button
table.button().add( 2, {
    action: function ( e, dt, button, config ) {
      var dit_row=dt.row( { selected: true } ).data();
      
      //dt.row( { selected: true } ).remove();
      //table.draw();
      
      self.action='delete';
      
      //delete from remote
      self.display_delete_form(dit_row); //should come after assigning action
    },
    text: 'Delete',
    className:'morfsot_buttons_delete'
} );

//add refresh button
table.button().add( 3, {
    action: function ( e, dt, button, config ) {
      //
      //alert("Reloading ");
      //$("#tbody").html('loading');
      //shwo loaderhttp://stackoverflow.com/questions/5648643/want-to-show-loader-gif-in-datatables
        dt.ajax.reload();
    },
    text: 'Refresh',
    className:'morfsot_buttons_refresh'
} );

  
 //place buttons to .buttons class div
 table.buttons( 0, null ).containers().appendTo( self.buttons_div );


//assign table 

self.table=table;
       	
 
   function spinner(state){
   	//shwo progess. alos activates or deactivates submit button
   	
   	if (state=='show'){
   		$(self.form_progress_div).html('<h4>\
	<i class="fa fa-circle-o-notch fa-spin fa-lg"></i>\
<span class="sr-only">Loading...</span> Processing ... Please wait ... </h4>');

//deactivate submit button
 $(".morfsot-submit").attr("disabled", true);   
     
   	}else{
   		$(self.form_progress_div).html(" ");
   		//activate submit button
         $(".morfsot-submit").attr("disabled", false); 
   	}
   	
   	
   }
    function get_table(){
    	return self.table;
    }
    
    function get_selected_row_id(){
    	return self.selected_row_id;
    }	
    
     function get_selected_row_data(){
    	return self.selected_row_data;
    }	
    
    
    function add_row(row_data){
    	//add row to created table
    	self.get_table().row.add(row_data).draw();
    }
    
    function display_create_edit_form(data=null){
    	
    	//this pupulates form with data fields and then displays
    	$.each(data,function(name,val){
    		var $el=$('[name="'+name+'"]'),
    		type=$el.attr('type');
    		
    		switch(type){
    			case 'checkbox':
    			$el.attr('checked','checked');
    			break;
    		    case 'radio':
    		    $el.filter('[value="'+val+'"]').attr('checked','checked');
    		    break;
    		    default:
    		    $el.val(val);
    		}
    	});
    	
    	
    //make sure to reset form if it is new
    //this avoids unnecessary editting of unplanned values
    if (self.action==='new'){
    	$(self.create_edit_form_class)[0].reset();
    }
    
    
    	//show
    	
    	  $(self.create_edit_modal_id).modal('show');
    }
    
   
  function display_delete_form(data){
    	//set form field id' value
    	
    	//set id 
    	// console.log($(self.delete_form_class)[0].elements.namedItem('id').value=data['id']);
    	 $(self.delete_form_class)[0].elements.namedItem('id').value=data['id'];
    	 //console.log(data['id']);
    	//$.each(data,function(name,val){
         //		var $el=$('[name="'+name+'"]');
    	//	$el.val(val);
    	
    	//	});
    	
    	
    	//show
    	  $(self.delete_modal_id).modal('show');
    }
    
    
   
	 self.add_row=add_row;
	 self.get_table=get_table;
	 self.display_create_edit_form=display_create_edit_form;
	 self.display_delete_form=display_delete_form;
	 self.get_selected_row_id=get_selected_row_id;
	 self.get_selected_row_data=get_selected_row_data;
	 
	 self.spinner=spinner; //spinner function to show or close progress
	 
	 
	 //get buttons via their class names
	 var edit_delete_buttons=table.buttons(['.morfsot_buttons_delete',
	 '.morfsot_buttons_edit']);
	 
	 
	 
//handlers

//attach submit handler to forms

//create form
$(self.create_edit_form_class).submit(function(event){
	//stop normal submit
	event.preventDefault();
	
	//get our form
	self.form=$(this);
	//get id from form. if id is not null then we are editting
	var id=self.form[0].elements['id'].value;
	//console.log(id);
	//post form
	//show loading text
	self.spinner('show');
	
	var posting;
	
	if (!id){
		//id is empty so create
		form_posting=$.post(self.create_url,self.form.serialize());
	}else{
		 form_posting=$.post(self.edit_url,self.form.serialize());
	}
	
	
	
	//handle processes
	form_posting.done(function(data){
		//alert("success");
		
		//show success message. this function depends on toastr.js and notify.js. make sure is included
		notify('success','Notification','Successful');
		
		
		//rest create form . make sure there are no hidden fields. change to display:none
		//this will enable them to be reset
		
		self.form[0].reset();
		//add row of returned data to table
		//console.log(data.data[0]);
		//close modal
		$(self.create_edit_modal_id).modal('hide');
		if (!id){
		//id is empty so we were adding. hence update table with new row
		self.add_row(data.data[0]);
	   }else{
	   	//we were editting. refresh table.
	   	table.ajax.reload().draw();
		}
	});
	
	form_posting.fail(function(data){
		//alert("failed");
		notify('error','Notification','Failed. Please try again');
		edit_delete_buttons.enable();
	});
	
	form_posting.always(function(data){
		//clear progress div
		self.spinner('hide');
		//disable edit and delete
		edit_delete_buttons.disable();
		
	});
	
});// ./ edit form


//delete form
$(self.delete_form_class).submit(function(event){
	//stop normal submit
	event.preventDefault();
	//get our form
	self.form=$(this);
	
	//get id from form. if id is not null then we are editting
	//var id=self.form[0].elements['id'].value;
	//post form
	//show loading text
	self.spinner('show');
	var form_posting=$.post(self.delete_url,self.form.serialize());
	
	
	
	//handle processes
	form_posting.done(function(data){
		//alert("success");
		
		//show success message. this function depends on toastr.js and notify.js. make sure is included
		notify('success','Notification','Successful');
		//rest create form
		self.form[0].reset();
		//add row of returned data to table
		//console.log(data.data[0]);
	   	//refresh table.
	   	//close modal
		$(self.delete_modal_id).modal('hide');
	   	table.ajax.reload().draw();
		
	});
	
	form_posting.fail(function(data){
		//alert("failed");
		notify('error','Notification','Failed. Please try again');
		edit_delete_buttons.enable();
	});
	
	form_posting.always(function(data){
		//clear progress div
		self.spinner('hide');
		//disable edit and delete
		edit_delete_buttons.disable();
		
	});
	
}); //end delete form handle


//register more event listeners. on table
table.on('select',function(e,dt,type,indexes){
	
	if(type==='rows'){
		//if many rows are selected
		//alert(dt.row( { selected: true } ).id());
		
		var data = table.rows( indexes ).data().pluck( 'id' );
 
        // do something with the ID of the selected items
        
	}
	else if (type==='row'){
		//if one row is selected
		//alert(dt.row( { selected: true } ).id());
		//get row identifier
		self.selected_row_id=dt.row( { selected: true } ).id();
		self.selected_row_data=dt.row( { selected: true } ).data();
		
		//enable buttons butons are described above
		edit_delete_buttons.enable();
	}
	
	//alert(self.get_selected_row_id());
	
}); //end select

table.on('deselect',function(e,dt,type,indexes){
	
	if(type==='rows'){
		//if many rows are selected
		//alert(dt.row( { selected: true } ).id());
		
		var data = table.rows( indexes ).data().pluck( 'id' );
 
        // do something with the ID of the selected items
        
	}
	else if (type==='row'){
		//if one row is selected
		//alert(dt.row( { selected: true } ).id());
		//get row identifier
		self.selected_row_id=null; //dt.row( { selected: true } ).id();
		self.selected_row_data=null; //
		
		//disable edit and delete
		edit_delete_buttons.disable();
		
	}
	
	//alert(self.get_selected_row_id());
	
}); //end deselect



//once table is loaded, disable edit,and delete buttons initially
edit_delete_buttons.disable();

//implement table search
//initialize search on given div
/*
$(self.search_div).append('<div class="input-group">\
 <input type="text" class="form-control" name="search_value" placeholder="Search !" />\
 <span class="input-group-btn"><button class="btn btn-default morfsot-datatables-search-btn " type="button">\
     Search</button></span></div>');*/

$(self.search_div).append('\
 <input type="text" class="form-control search_value" name="search_value" placeholder="Search !" />');
     
//register search handler
//use class defined above for search
$('.search_value').keyup(function(){
	//get search value
	var  search_value=$(this).val();
	
	//sset table url and pull data immediately
	var new_ajax_url=self.ajax_url+'?search_value='+search_value;
	table.ajax.url(new_ajax_url).load();
	
});

 
 //get returned ajax data after every ajax request.
 table.on( 'xhr', function () {
    var json = table.ajax.json();
    //set pagination data
    self.pagination=json.pagination;
    
    //create pagination
    create_pagination();
    
    //console.log( json.data.length +' row(s) were loaded' );
    //console.log(json);
} );

//after pagination has been set, lets draw the html.
function create_pagination(){
	//for None or null do not display links.
	//pagination should returns none or null pages if not available
	
	//uses set pagination data
	//console.log(self.pagination);
	//
	var prev='';
	var next='';
	
	if (self.pagination.previous_page){
		//console.log(self.pagination.previous_page);
		prev='<li><a href="#" class="pagination-previous" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
	}
	
	if (self.pagination.next_page){
		//console.log(self.pagination.next_page);
		next='<li><a href="#" class="pagination-next" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
	}
	
	
	$(self.pagination_div).html('<nav><ul class="pagination">'+prev+'\
    <li><a href="#">Page '+self.pagination.current_page+' of '+self.pagination.total_pages+'</a></li>\
    '+next+'</ul></nav>');
    
	
}//end function create_pagination

//register pagination click handler
//previous
$( "body" ).on( "click", ".pagination-previous", function(event) {
	event.preventDefault();
var new_ajax_url=self.ajax_url+'?page='+self.pagination.previous_page;
table.ajax.url(new_ajax_url).load();
});
//next
$( "body" ).on( "click", ".pagination-next", function(event) {
	event.preventDefault(); //avoid triggering page load on link
	var new_ajax_url=self.ajax_url+'?page='+self.pagination.next_page;
	table.ajax.url(new_ajax_url).load();
});
/*===============end paginatio handler ========= */





}

